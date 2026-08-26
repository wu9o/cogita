import { existsSync, readFileSync } from 'node:fs';
import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig, CogitaTheme } from '@cogita/shared';
import type { RspressPlugin, UserConfig } from '@rspress/core';
import { findUp } from 'find-up';
import jiti from 'jiti';
import * as mlly from 'mlly';
import type { CogitaConfig, CogitaFullConfig, PostsConfig } from '../types';
import { createContentIndex } from './content-index';
import { registerPlugins } from './plugin-registry';
import { cogitaRuntimeDefaults } from './runtime-modules';
import { resolveThemePackage } from './theme';

const CONFIG_FILES = ['cogita.config.ts', 'cogita.config.js', 'cogita.config.mjs'];

// 获取当前模块的文件路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 缓存包根目录，避免重复查找
let packageRootCache: string | null = null;
let packageVersionCache: string | null = null;

/** 读取 Core 包版本，供插件构建上下文和诊断信息使用。 */
function getPackageVersion(): string {
  if (packageVersionCache) {
    return packageVersionCache;
  }

  try {
    const packageJsonPath = path.resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: unknown;
    };
    if (typeof packageJson.version === 'string' && packageJson.version.length > 0) {
      packageVersionCache = packageJson.version;
      return packageVersionCache;
    }
  } catch {
    // 版本读取失败时使用稳定的未知值，不能阻断站点构建。
  }

  return 'unknown';
}

function getSiteIconSource(root: string, icon: string) {
  const publicRoot = path.resolve(root, 'public');
  const normalizedIcon = icon.replace(/^[/\\]+/, '');
  const publicRelativePath = normalizedIcon.startsWith(`public${path.sep}`)
    ? normalizedIcon.slice(`public${path.sep}`.length)
    : normalizedIcon;
  const sourcePath =
    path.isAbsolute(icon) && icon.startsWith(root + path.sep)
      ? icon
      : path.resolve(publicRoot, publicRelativePath);

  return {
    publicRelativePath,
    sourcePath,
  };
}

/**
 * 解析站点图标的公共访问路径。
 */
function resolveSiteIcon(root: string, icon?: string): string | undefined {
  if (!icon) {
    return undefined;
  }

  const { publicRelativePath } = getSiteIconSource(root, icon);
  return `/${publicRelativePath.split(path.sep).join('/')}`;
}

/**
 * 将 public 目录中的站点图标同步到 Rspress 使用的虚拟文档目录。
 */
export async function prepareSiteIcon(root: string, docDirectory: string, icon?: string) {
  if (!icon) {
    return;
  }

  const { publicRelativePath, sourcePath } = getSiteIconSource(root, icon);
  const targetPath = path.join(docDirectory, 'public', publicRelativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

/**
 * 将站点的 Markdown 文档源复制到 Rspress 的虚拟文档目录。
 *
 * Cogita 的动态文章和插件页面使用虚拟文档目录，以避免 Rspress 直接扫描
 * 站点根目录；文档站点需要通过 contentDir 显式打开普通 Markdown 页面。
 */
export async function prepareContentDirectory(
  root: string,
  docDirectory: string,
  contentDir?: string
) {
  if (!contentDir) {
    return;
  }

  const sourceDirectory = path.resolve(root, contentDir);
  const targetDirectory = path.resolve(docDirectory);

  if (sourceDirectory === targetDirectory) {
    throw new Error('contentDir 不能指向 Cogita 的虚拟文档目录。');
  }

  if (!existsSync(sourceDirectory)) {
    throw new Error(`文档源目录不存在：${sourceDirectory}`);
  }

  await rm(targetDirectory, { recursive: true, force: true });
  await mkdir(targetDirectory, { recursive: true });

  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) =>
      cp(path.join(sourceDirectory, entry.name), path.join(targetDirectory, entry.name), {
        recursive: entry.isDirectory(),
        force: true,
      })
    )
  );
}

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
    createCogitaLogger().error(`Failed to load config file: ${configPath}`);
    throw e;
  }
}

interface LoadedTheme {
  config: CogitaTheme;
  directory: string;
}

async function loadTheme(themeName: string, projectRoot: string): Promise<LoadedTheme> {
  // 优先从站点项目解析主题，使外部仓库可以独立安装和使用主题包。
  let url: string;
  try {
    url = await mlly.resolve(themeName, { url: projectRoot });
  } catch (error) {
    // 保留旧版 workspace 场景的回退路径，便于迁移期间继续使用内置主题别名。
    const packageRoot = await getPackageRoot();
    try {
      url = await mlly.resolve(themeName, { url: packageRoot });
    } catch {
      throw error;
    }
  }

  const themeEntryPath = fileURLToPath(url);
  const _require = jiti(fileURLToPath(import.meta.url));
  const mod = _require(themeEntryPath);

  // Check for the exported getThemeConfig function
  if (typeof mod.getThemeConfig !== 'function') {
    throw new Error(`Theme '${themeName}' does not export a 'getThemeConfig' function.`);
  }

  // Call the function to get the theme configuration object
  return {
    config: mod.getThemeConfig(),
    directory: path.dirname(themeEntryPath),
  };
}

/**
 * 创建主题插件
 *
 * 职责：
 * 1. 加载主题的 globalStyles（样式文件）
 * 2. 注册主题的 globalUIComponents（全局组件如 Footer）
 * 3. 注册主题的页面布局（ome 页面）
 */
function createThemePlugin(theme: CogitaTheme, themeDirectory: string): RspressPlugin {
  return {
    name: 'cogita-theme-plugin',
    // 注入主题全局样式（theme.css），让首页/tag页等自定义布局样式生效
    globalStyles: theme.globalStyles,
    // 注册主题的全局 UI 组件（如 Footer、合集导航等），使其在所有页面生效
    globalUIComponents: theme.globalUIComponents ?? [],
    addPages: async () => {
      if (!theme.pageLayouts.home) {
        return [];
      }

      const homeLayoutPath = path.resolve(themeDirectory, theme.pageLayouts.home);
      if (!existsSync(homeLayoutPath)) {
        return [];
      }

      return [
        {
          routePath: '',
          content: '---\npageType: home\nsidebar: false\n---',
          filepath: homeLayoutPath,
        },
      ];
    },
  };
}

/** 校验主题和已实例化插件声明的布局，避免构建成功但页面静默变成 404。 */
function validateThemeLayouts(
  config: CogitaFullConfig,
  theme: CogitaTheme,
  plugins: readonly CogitaPlugin[],
  strict: boolean,
  themeLayouts?: Record<string, string>
) {
  const missing = new Set<string>();
  const homeLayout = theme.pageLayouts?.home;
  if (!homeLayout || !themeLayouts?.home || !existsSync(themeLayouts.home)) {
    missing.add('首页');
  }

  for (const plugin of plugins) {
    for (const requirement of plugin.cogita?.requiredLayouts || []) {
      if (requirement.when && !requirement.when(config)) {
        continue;
      }

      const layoutPath = themeLayouts?.[requirement.layout];
      if (!theme.pageLayouts?.[requirement.layout] || !layoutPath || !existsSync(layoutPath)) {
        missing.add(requirement.label || requirement.layout);
      }
    }
  }

  if (missing.size === 0) {
    return;
  }

  const message = `[Cogita] 已启用的功能缺少主题布局：${Array.from(missing).join('、')}`;
  if (strict) {
    throw new Error(`${message}。请在主题的 pageLayouts 中补齐对应布局，或关闭相关功能。`);
  }

  (config.buildContext.logger || createCogitaLogger()).warn(
    `${message}，非严格模式下将跳过缺失页面。`
  );
}

/** 清理第三方插件提供的能力标识，避免空值和重复值污染诊断结果。 */
function normalizeCapabilities(values: readonly string[] | undefined): string[] {
  return Array.from(
    new Set(
      (values || [])
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

/** 校验主题和插件之间的能力契约，避免能力缺失时才在浏览器中暴露空页面。 */
function validateCapabilities(
  config: CogitaFullConfig,
  theme: CogitaTheme | undefined,
  plugins: readonly CogitaPlugin[],
  strict: boolean
) {
  const providedCapabilities = new Set<string>();
  for (const plugin of plugins) {
    for (const capability of normalizeCapabilities(plugin.cogita?.providesCapabilities)) {
      providedCapabilities.add(capability);
    }
  }

  const missing = new Set<string>();
  for (const capability of normalizeCapabilities(theme?.capabilities?.required)) {
    if (!providedCapabilities.has(capability)) {
      missing.add(`主题需要能力 ${capability}`);
    }
  }

  for (const plugin of plugins) {
    for (const capability of normalizeCapabilities(plugin.cogita?.requiresCapabilities)) {
      if (!providedCapabilities.has(capability)) {
        missing.add(`插件 ${plugin.name} 依赖能力 ${capability}`);
      }
    }
  }

  if (missing.size === 0) {
    return;
  }

  const message = `[Cogita] 能力契约未满足：${Array.from(missing).join('；')}`;
  if (strict) {
    throw new Error(`${message}。请注册提供对应能力的插件，或将该能力改为主题的 optional 能力。`);
  }

  (config.buildContext.logger || createCogitaLogger()).warn(
    `${message}，非严格模式下继续构建并由主题自行降级。`
  );
}

/**
 * Create enhanced configuration object for plugin factories
 */
function createFullConfig(cogitaConfig: CogitaConfig, root: string): CogitaFullConfig {
  const posts: Required<Pick<PostsConfig, 'dir' | 'routePrefix' | 'extensions'>> = {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md', 'mdx'],
    ...cogitaConfig.posts,
  };
  const logger = createCogitaLogger();
  const contentIndex = createContentIndex(root, posts, logger);
  const strict = cogitaConfig.strict !== false;
  const framework = {
    version: getPackageVersion(),
    buildTime: new Date().toISOString(),
  };

  const fullConfig: CogitaFullConfig = {
    ...cogitaConfig,
    root,
    cwd: root,
    contentIndex,
    _framework: framework,
    buildContext: {
      root,
      cwd: root,
      contentIndex,
      strict,
      logger,
      framework,
    },
    // Enhanced site config with defaults
    site: {
      title: 'Cogita Blog',
      description: 'A blog powered by Cogita',
      ...cogitaConfig.site,
    },
    // Posts plugin config with defaults
    posts,
    // Tags plugin config with defaults (if enabled)
    tags: cogitaConfig.tags
      ? {
          enabled: true,
          routePrefix: 'tags',
          tagCloud: {
            minFontSize: 12,
            maxFontSize: 24,
            minOpacity: 0.5,
            maxOpacity: 1.0,
            sortBy: 'count',
            limit: 50,
          },
          layout: 'tag',
          excludeTags: [],
          minPostCount: 1,
          tagTransform: (tag: string) => tag,
          ...cogitaConfig.tags,
        }
      : undefined,
    // 分类只有显式配置时才启用，避免改变已有站点输出
    categories: cogitaConfig.categories
      ? {
          enabled: true,
          routePrefix: 'categories',
          separator: '/',
          metadata: {},
          excludeCategories: [],
          minPostCount: 1,
          sortBy: 'name' as const,
          ...cogitaConfig.categories,
        }
      : undefined,
    // 阅读进度默认启用，确保主题可以安全消费阅读统计虚拟模块
    readingProgress: {
      enabled: true,
      showBar: true,
      showReadingTime: true,
      showTocProgress: true,
      rememberPosition: false,
      wordsPerMinute: 300,
      includeCode: false,
      ...cogitaConfig.readingProgress,
    },
    // 代码复制默认启用，确保技术文章开箱即用
    codeCopy: {
      enabled: true,
      selector: '.rspress-doc pre',
      buttonLabel: '复制代码',
      selectionLabel: '复制选中代码',
      languageLabel: '复制 {language} 代码',
      copiedLabel: '已复制',
      errorLabel: '复制失败',
      resetDelay: 2000,
      ...cogitaConfig.codeCopy,
    },
    // 评论默认关闭，但始终提供虚拟模块，保证主题可以安全消费配置
    comments: {
      enabled: false,
      provider: 'giscus' as const,
      title: '评论',
      ...cogitaConfig.comments,
      giscus: {
        repo: '',
        repoId: '',
        category: '',
        categoryId: '',
        mapping: 'pathname' as const,
        strict: false,
        reactionsEnabled: true,
        emitMetadata: false,
        inputPosition: 'bottom' as const,
        theme: 'preferred_color_scheme',
        lang: 'zh-CN',
        loading: 'lazy' as const,
        ...cogitaConfig.comments?.giscus,
      },
      utterances: {
        repo: '',
        issueTerm: 'pathname' as const,
        term: '',
        label: '',
        theme: 'github-light',
        ...cogitaConfig.comments?.utterances,
      },
    },
    // 文章列表只有显式配置时才启用，避免改变已有首页输出
    blogList: cogitaConfig.blogList
      ? {
          enabled: true,
          routePrefix: 'archive',
          pageSize: 10,
          sortBy: 'createDate' as const,
          order: 'desc' as const,
          generateArchives: true,
          archivePrefix: 'archives',
          archiveGranularity: 'year' as const,
          ...cogitaConfig.blogList,
        }
      : undefined,
    // 搜索只有显式配置时才启用，避免改变已有站点输出
    search: cogitaConfig.search
      ? {
          enabled: true,
          routePrefix: 'search',
          includeContent: false,
          maxContentLength: 12_000,
          maxResults: 20,
          minQueryLength: 1,
          ...cogitaConfig.search,
          fields: {
            title: true,
            description: true,
            excerpt: true,
            tags: true,
            categories: true,
            content: false,
            ...cogitaConfig.search.fields,
          },
          analytics: {
            enabled: false,
            eventName: 'cogita:search',
            includeQuery: false,
            includeFilters: false,
            ...cogitaConfig.search.analytics,
          },
        }
      : undefined,
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
    // 图片插件配置默认启用，确保主题可以安全导入虚拟图片模块
    images: {
      enabled: true,
      dir: 'public/images',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'],
      readDimensions: true,
      failOnMissing: strict,
      warnOnMissingAlt: false,
      ...cogitaConfig.images,
    },
    // 站点地图只有显式配置时才启用，保持默认构建不产生额外文件
    sitemap: cogitaConfig.sitemap
      ? {
          enabled: true,
          path: 'sitemap.xml',
          includeHome: true,
          includePosts: true,
          includeBlogList: true,
          includeSearch: true,
          includeCategories: true,
          changefreq: 'weekly' as const,
          priority: 0.7,
          failOnMissingSiteUrl: strict,
          ...cogitaConfig.sitemap,
        }
      : undefined,
    // SEO 只有显式配置时才启用，避免改变现有 HTML 输出
    seo: cogitaConfig.seo
      ? {
          enabled: true,
          robots: 'index, follow',
          includeJsonLd: true,
          ...cogitaConfig.seo,
        }
      : undefined,
  };

  return fullConfig;
}

export async function createRspressConfig(
  cogitaConfig: CogitaConfig,
  root: string
): Promise<UserConfig> {
  // 1. Default to 'lucid' alias if no theme is specified
  const themeName = resolveThemePackage(cogitaConfig);

  let loadedTheme: LoadedTheme | null = null;
  if (themeName) {
    loadedTheme = await loadTheme(themeName, root);
  }

  // 3. Build the base Rspress config first
  const existingRspackTools = cogitaConfig.builderConfig?.tools?.rspack;
  const rspackTools = existingRspackTools
    ? Array.isArray(existingRspackTools)
      ? [...existingRspackTools]
      : [existingRspackTools]
    : [];
  // Rspress 生成的语法高亮虚拟模块同时包含 ESM 和 CommonJS 语法，需要使用兼容解析模式。
  rspackTools.push((rspackConfig) => {
    rspackConfig.module.rules ??= [];
    rspackConfig.module.rules.push({
      test: /virtual-prism-languages/,
      type: 'javascript/auto',
    });
  });

  const baseRspressConfig: UserConfig = {
    root,
    title: cogitaConfig.site?.title,
    description: cogitaConfig.site?.description,
    lang: cogitaConfig.site?.lang,
    icon: resolveSiteIcon(root, cogitaConfig.site?.icon),
    base: cogitaConfig.site?.base,
    markdown: cogitaConfig.markdown,
    mediumZoom: cogitaConfig.mediumZoom,
    themeConfig: cogitaConfig.themeConfig,
    builderConfig: {
      ...cogitaConfig.builderConfig,
      tools: {
        ...cogitaConfig.builderConfig?.tools,
        rspack: rspackTools,
      },
    },
    plugins: [], // Will be populated next
  };

  // 4. Create enhanced config object for plugin factories
  const fullConfigForPlugins = createFullConfig(cogitaConfig, root);

  // 4.1 注入主题布局组件绝对路径，让 tags 等插件能用主题布局作为 addPages 的 filepath
  if (loadedTheme?.config.pageLayouts) {
    const themeDir = loadedTheme.directory;
    const themeLayouts: Record<string, string> = {};
    for (const [key, relPath] of Object.entries(loadedTheme.config.pageLayouts)) {
      if (relPath) {
        themeLayouts[key] = path.resolve(themeDir, relPath);
      }
    }
    fullConfigForPlugins.themeLayouts = themeLayouts;
    fullConfigForPlugins.buildContext.themeLayouts = themeLayouts;
  }
  // 5. 按稳定顺序实例化主题插件和用户插件
  const strict = cogitaConfig.strict !== false; // Default to true
  const pluginConfig: CogitaPluginConfig = fullConfigForPlugins;
  const logger = fullConfigForPlugins.buildContext.logger || createCogitaLogger();
  const finalPlugins = registerPlugins(
    [
      {
        plugin: {
          name: 'cogita-content-index',
          beforeBuild() {
            fullConfigForPlugins.buildContext.contentIndex?.invalidate?.();
          },
        },
        source: 'core',
      },
      {
        plugin: cogitaRuntimeDefaults,
        source: 'core',
      },
      ...(loadedTheme
        ? [
            {
              plugin: createThemePlugin(loadedTheme.config, loadedTheme.directory),
              source: 'theme',
            },
          ]
        : []),
    ],
    [
      { name: 'theme', factories: loadedTheme?.config.plugins || [] },
      { name: 'user', factories: cogitaConfig.plugins || [] },
    ],
    pluginConfig,
    { strict, logger }
  );

  validateCapabilities(fullConfigForPlugins, loadedTheme?.config, finalPlugins, strict);

  if (loadedTheme) {
    validateThemeLayouts(
      fullConfigForPlugins,
      loadedTheme.config,
      finalPlugins,
      strict,
      fullConfigForPlugins.themeLayouts
    );
  }

  baseRspressConfig.plugins = finalPlugins;

  return baseRspressConfig;
}
