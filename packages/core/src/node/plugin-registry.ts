import type {
  CogitaLogger,
  CogitaPlugin,
  CogitaPluginConfig,
  CogitaPluginFactory,
} from '@cogita/shared';

/** 一组插件工厂及其来源，用于生成可诊断的注册信息。 */
export interface PluginFactorySource {
  name: string;
  factories: readonly CogitaPluginFactory[];
}

/** 已经实例化的插件及其来源。 */
export interface PluginRegistration {
  plugin: CogitaPlugin;
  source: string;
}

export interface PluginRegistryOptions {
  strict: boolean;
  logger: CogitaLogger;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function withCause(message: string, cause: unknown): Error {
  const error = new Error(message);
  (error as Error & { cause?: unknown }).cause = cause;
  return error;
}

/** 保护核心注册器不被运行时无效的第三方工厂返回值破坏。 */
function isRspressPlugin(value: unknown): value is CogitaPlugin {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const name = (value as { name?: unknown }).name;
  return typeof name === 'string' && name.trim().length > 0;
}

/** 将 addPages 返回的路由规范化为可比较的键。 */
function normalizePageRoute(route: unknown): string | null {
  if (typeof route !== 'string') {
    return null;
  }

  const normalized = `/${route.trim().replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '/' : normalized;
}

/** 为运行时虚拟模块规范化可比较的模块标识。 */
function normalizeRuntimeModuleId(moduleId: unknown): string | null {
  if (typeof moduleId !== 'string') {
    return null;
  }

  const normalized = moduleId.trim();
  return normalized.length > 0 ? normalized : null;
}

/** 判断模块是否来自 Core 提供的可覆盖默认实现。 */
function isRuntimeDefaultProvider(plugin: CogitaPlugin): boolean {
  return plugin.name === 'cogita-runtime-defaults';
}

/** 为页面生成增加统一的路由冲突保护，避免静默覆盖同一路径。 */
function withPageRouteContract(
  plugin: CogitaPlugin,
  source: string,
  registeredRoutes: Map<string, string>,
  options: PluginRegistryOptions
): CogitaPlugin {
  if (typeof plugin.addPages !== 'function') {
    return plugin;
  }

  const originalAddPages = plugin.addPages;
  const wrappedPlugin = { ...plugin };

  wrappedPlugin.addPages = async (...args) => {
    const pages = await originalAddPages(...args);
    if (!Array.isArray(pages)) {
      return pages;
    }

    return pages.filter((page) => {
      if (!page || typeof page !== 'object') {
        return true;
      }

      const route = normalizePageRoute((page as { routePath?: unknown }).routePath);
      if (!route) {
        return true;
      }

      const previousSource = registeredRoutes.get(route);
      if (!previousSource) {
        registeredRoutes.set(route, source);
        return true;
      }

      const message = `[Cogita] 页面路由 ${route} 重复注册（来源：${previousSource}、${source}）`;
      if (options.strict) {
        throw new Error(message);
      }

      options.logger.warn(`${message}，非严格模式下保留首次注册。`);
      return false;
    });
  };

  return wrappedPlugin;
}

/** 为运行时模块生成增加冲突保护，同时允许业务插件覆盖 Core 默认模块。 */
function withRuntimeModuleContract(
  plugin: CogitaPlugin,
  source: string,
  registeredModules: Map<string, { source: string; isDefault: boolean }>,
  options: PluginRegistryOptions
): CogitaPlugin {
  if (typeof plugin.addRuntimeModules !== 'function') {
    return plugin;
  }

  const originalAddRuntimeModules = plugin.addRuntimeModules;
  const wrappedPlugin = { ...plugin };

  wrappedPlugin.addRuntimeModules = async (...args) => {
    const modules = await originalAddRuntimeModules(...args);
    if (!modules || typeof modules !== 'object') {
      return modules;
    }

    const isDefault = isRuntimeDefaultProvider(plugin);
    const acceptedModules = { ...modules };
    for (const moduleId of Object.keys(modules)) {
      const normalizedModuleId = normalizeRuntimeModuleId(moduleId);
      if (!normalizedModuleId || typeof modules[moduleId] !== 'string') {
        continue;
      }

      const previous = registeredModules.get(normalizedModuleId);
      if (!previous) {
        registeredModules.set(normalizedModuleId, { source, isDefault });
        continue;
      }

      if (previous.source === source) {
        continue;
      }

      if (previous.isDefault && !isDefault) {
        registeredModules.set(normalizedModuleId, { source, isDefault: false });
        continue;
      }

      if (!previous.isDefault && isDefault) {
        delete acceptedModules[moduleId];
        continue;
      }

      const message = `[Cogita] 运行时模块 ${normalizedModuleId} 重复注册（来源：${previous.source}、${source}）`;
      if (options.strict) {
        throw new Error(message);
      }

      options.logger.warn(
        `${message}，非严格模式下保留${previous.isDefault ? '默认' : '首次'}注册。`
      );
      delete acceptedModules[moduleId];
    }

    return acceptedModules;
  };

  return wrappedPlugin;
}

/**
 * 按固定来源顺序实例化并注册插件。
 *
 * 核心插件和主题桥接插件先注册，随后执行主题工厂和用户工厂。
 * 这里集中处理名称唯一性、无效返回值和严格模式，避免配置加载器继续承担这些策略。
 */
export function registerPlugins(
  initialPlugins: readonly PluginRegistration[],
  factorySources: readonly PluginFactorySource[],
  config: CogitaPluginConfig,
  options: PluginRegistryOptions
): CogitaPlugin[] {
  const finalPlugins: CogitaPlugin[] = [];
  const registeredPluginSources = new Map<string, string>();
  const registeredPageRoutes = new Map<string, string>();
  const registeredRuntimeModules = new Map<string, { source: string; isDefault: boolean }>();

  const registerPlugin = (value: unknown, source: string) => {
    if (!isRspressPlugin(value)) {
      const message = `[Cogita] ${source} 返回了无效插件，插件必须提供非空 name 字段`;
      if (options.strict) {
        throw new Error(message);
      }
      options.logger.warn(`${message}，非严格模式下跳过。`);
      return;
    }

    const previousSource = registeredPluginSources.get(value.name);
    if (previousSource) {
      const message = `[Cogita] 插件 ${value.name} 重复注册（来源：${previousSource}、${source}）`;
      if (options.strict) {
        throw new Error(message);
      }
      options.logger.warn(`${message}，非严格模式下保留首次注册。`);
      return;
    }

    registeredPluginSources.set(value.name, source);
    const pageContract = withPageRouteContract(value, source, registeredPageRoutes, options);
    finalPlugins.push(
      withRuntimeModuleContract(pageContract, source, registeredRuntimeModules, options)
    );
  };

  for (const { plugin, source } of initialPlugins) {
    registerPlugin(plugin, source);
  }

  for (const { name: sourceName, factories } of factorySources) {
    factories.forEach((factory, factoryIndex) => {
      const source = `${sourceName}[${factoryIndex}]`;
      try {
        const result = factory(config);
        if (!result) {
          return;
        }

        const plugins = Array.isArray(result) ? result : [result];
        plugins.forEach((plugin, pluginIndex) => {
          registerPlugin(plugin, `${source}${plugins.length > 1 ? `#${pluginIndex}` : ''}`);
        });
      } catch (error) {
        const message = `[Cogita] ${source} 插件工厂执行失败：${formatError(error)}`;
        if (options.strict) {
          throw withCause(message, error);
        }
        options.logger.warn(`${message}，非严格模式下跳过。`);
      }
    });
  }

  return finalPlugins;
}
