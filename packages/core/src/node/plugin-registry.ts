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
    finalPlugins.push(withPageRouteContract(value, source, registeredPageRoutes, options));
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
