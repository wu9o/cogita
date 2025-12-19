import { readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CogitaTheme } from '@cogita/shared';
import type { RspressPlugin, UserConfig } from '@rspress/core';
import { findUp } from 'find-up';
import jiti from 'jiti';
import * as mlly from 'mlly';
import type { CogitaConfig, CogitaFullConfig } from '../types';

const CONFIG_FILES = ['cogita.config.ts', 'cogita.config.js', 'cogita.config.mjs'];

// 获取当前模块的文件路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 缓存包根目录，避免重复查找
let packageRootCache: string | null = null;

/**
 * 获取@cogita/core包的根目录
 * @returns 包根目录的绝对路径
 */
async function getPackageRoot(): Promise<string> {
  if (packageRootCache) {
    return packageRootCache;
  }

  // 向上查找package.json文件
  const packageJsonPath = await findUp('package.json', {
    cwd: __dirname,
    type: 'file',
  });

  if (!packageJsonPath) {
    throw new Error('Could not find package.json in parent directories');
  }

  // 验证找到的是否是@cogita/core的package.json
  const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  if (packageJson.name !== '@cogita/core') {
    throw new Error(`Found package.json but it's not for @cogita/core: ${packageJsonPath}`);
  }

  // 获取包根目录（package.json所在的目录）
  const packageRoot = dirname(packageJsonPath);
  packageRootCache = packageRoot;

  return packageRoot;
}

export async function loadCogitaConfig(root: string = process.cwd()): Promise<CogitaConfig> {
  const configPath = await findUp(CONFIG_FILES, { cwd: root });

  if (!configPath) {
    return {};
  }

  try {
    const _require = jiti(fileURLToPath(import.meta.url));
    const mod = _require(configPath);
    return mod.default || {};
  } catch (e) {
    console.error(`Failed to load config file: ${configPath}`);
    throw e;
  }
}

async function loadTheme(themeName: string): Promise<CogitaTheme> {
  // Resolve theme package from the location of @cogita/core, not the user's project
  const packageRoot = await getPackageRoot();
  const url = await mlly.resolve(themeName, { url: packageRoot });
  const themeEntryPath = fileURLToPath(url);
  const _require = jiti(fileURLToPath(import.meta.url));
  const mod = _require(themeEntryPath);

  // Check for the exported getThemeConfig function
  if (typeof mod.getThemeConfig !== 'function') {
    throw new Error(`Theme '${themeName}' does not export a 'getThemeConfig' function.`);
  }

  // Call the function to get the theme configuration object
  return mod.getThemeConfig();
}

/**
 * 创建主题插件
 * 
 * 职责：
 * 1. 加载主题的 globalStyles（样式文件）
 * 2. 注册主题的 globalUIComponents（全局组件如 Footer）
 * 3. 注册主题的页面布局（ome 页面）
 */
function createThemePlugin(theme: CogitaTheme): RspressPlugin {
  return {
    name: 'cogita-theme-plugin',
    // 主题样式 - 直接传递给 Rspress
    globalStyles: theme.globalStyles,
    // 全局 UI 组件 - 直接传递给 Rspress
    globalUIComponents: theme.globalUIComponents,
    // 注册主题的页面布局
    addPages: async () => {
      if (!theme.pageLayouts.home) {
        return [];
      }

      // Resolve theme package from the location of @cogita/core
      const packageRoot = await getPackageRoot();
      const url = await mlly.resolve(theme.name, {
        url: packageRoot,
      });
      const themeDir = path.dirname(fileURLToPath(url));
      const homeLayoutPath = path.resolve(themeDir, theme.pageLayouts.home);

      return [
        {
          routePath: '',
          content: '---\npageType: home\n---',
          filepath: homeLayoutPath,
        },
      ];
    },
  };
}

const BUILT_IN_THEMES: {
  [key: string]: string;
} = {
  lucid: '@cogita/theme-lucid',
};

/**
 * Create enhanced configuration object for plugin factories
 */
function createFullConfig(cogitaConfig: CogitaConfig, root: string): CogitaFullConfig {
  return {
    ...cogitaConfig,
    root,
    cwd: root,
    _framework: {
      version: '0.0.1', // TODO: get from package.json
      buildTime: new Date().toISOString(),
    },
    // Enhanced site config with defaults
    site: {
      title: 'Cogita Blog',
      description: 'A blog powered by Cogita',
      ...cogitaConfig.site,
    },
    // Posts plugin config with defaults
    posts: {
      dir: 'posts',
      routePrefix: 'posts',
      extensions: ['md', 'mdx'],
      ...cogitaConfig.posts,
    },
    // RSS plugin config with defaults (if enabled)
    rss: cogitaConfig.rss
      ? {
          formats: ['rss'],
          maxItems: 20,
          language: 'en',
          feedPath: 'rss.xml',
          atomPath: 'atom.xml',
          jsonPath: 'feed.json',
          includeContent: false,
          // Fallback to site URL if not specified
          link: cogitaConfig.rss.link || cogitaConfig.site?.url,
          ...cogitaConfig.rss,
        }
      : undefined,
  };
}

export async function createRspressConfig(
  cogitaConfig: CogitaConfig,
  root: string
): Promise<UserConfig> {
  // 1. Default to 'lucid' alias if no theme is specified
  const themeAlias = cogitaConfig.theme || 'lucid';
  // 2. Resolve alias to full package name, or use the value as-is for custom themes
  const themeName = BUILT_IN_THEMES[themeAlias] || themeAlias;

  let theme: CogitaTheme | null = null;
  if (themeName) {
    theme = await loadTheme(themeName);
  }

  // 3. Build the base Rspress config first
  const baseRspressConfig: UserConfig = {
    root,
    title: cogitaConfig.site?.title,
    description: cogitaConfig.site?.description,
    base: cogitaConfig.site?.base,
    themeConfig: cogitaConfig.themeConfig,
    builderConfig: cogitaConfig.builderConfig,
    plugins: [], // Will be populated next
  };

  // 4. Create enhanced config object for plugin factories
  const fullConfigForPlugins = createFullConfig(cogitaConfig, root);

  // 5. Instantiate plugins from the theme's plugin factories with enhanced error handling
  const themePlugins: RspressPlugin[] = [];
  const strict = cogitaConfig.strict !== false; // Default to true

  if (theme?.plugins) {
    for (const factory of theme.plugins) {
      try {
        const result = factory(fullConfigForPlugins as any);

        if (result) {
          // Handle both single plugin and array of plugins
          const plugins = Array.isArray(result) ? result : [result];
          themePlugins.push(...plugins);
        }
      } catch (error) {
        const errorMessage = `[Cogita] Plugin instantiation failed: ${error}`;

        if (strict) {
          throw new Error(errorMessage);
        }
        console.warn(errorMessage);
      }
    }
  }

  // 6. Combine all plugins
  const finalPlugins: RspressPlugin[] = [];
  if (theme) {
    finalPlugins.push(createThemePlugin(theme));
  }
  finalPlugins.push(...themePlugins);

  baseRspressConfig.plugins = finalPlugins;

  return baseRspressConfig;
}
