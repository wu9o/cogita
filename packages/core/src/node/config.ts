import { readFileSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CogitaTheme } from '@cogita/shared';
import type { RspressPlugin, UserConfig } from '@rspress/core';
import { findUp } from 'find-up';
import jiti from 'jiti';
import * as mlly from 'mlly';
import type { CogitaConfig, CogitaFullConfig, PostsConfig } from '../types';
import { createContentIndex } from './content-index';
import { resolveThemePackage } from './theme';

const CONFIG_FILES = ['cogita.config.ts', 'cogita.config.js', 'cogita.config.mjs'];

// 获取当前模块的文件路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 缓存包根目录，避免重复查找
let packageRootCache: string | null = null;

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
    // 注入主题全局样式（theme.css），让首页/tag页等自定义布局样式生效
    globalStyles: theme.globalStyles,
    // 注册主题的全局 UI 组件（如 Footer、合集导航等），使其在所有页面生效
    globalUIComponents: theme.globalUIComponents ?? [],
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
          content: '---\npageType: home\nsidebar: false\n---',
          filepath: homeLayoutPath,
        },
      ];
    },
  };
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

  return {
    ...cogitaConfig,
    root,
    cwd: root,
    contentIndex: createContentIndex(root, posts),
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
      failOnMissing: cogitaConfig.strict !== false,
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
          failOnMissingSiteUrl: cogitaConfig.strict !== false,
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
}

export async function createRspressConfig(
  cogitaConfig: CogitaConfig,
  root: string
): Promise<UserConfig> {
  // 1. Default to 'lucid' alias if no theme is specified
  const themeName = resolveThemePackage(cogitaConfig);

  let theme: CogitaTheme | null = null;
  if (themeName) {
    theme = await loadTheme(themeName);
  }

  // 3. Build the base Rspress config first
  const baseRspressConfig: UserConfig = {
    root,
    title: cogitaConfig.site?.title,
    description: cogitaConfig.site?.description,
    icon: resolveSiteIcon(root, cogitaConfig.site?.icon),
    base: cogitaConfig.site?.base,
    markdown: cogitaConfig.markdown,
    mediumZoom: cogitaConfig.mediumZoom,
    themeConfig: cogitaConfig.themeConfig,
    builderConfig: cogitaConfig.builderConfig,
    plugins: [], // Will be populated next
  };

  // 4. Create enhanced config object for plugin factories
  const fullConfigForPlugins = createFullConfig(cogitaConfig, root);

  // 4.1 注入主题布局组件绝对路径，让 tags 等插件能用主题布局作为 addPages 的 filepath
  if (theme?.pageLayouts) {
    const packageRoot = await getPackageRoot();
    const themeUrl = await mlly.resolve(theme.name, { url: packageRoot });
    const themeDir = path.dirname(fileURLToPath(themeUrl));
    const themeLayouts: Record<string, string> = {};
    for (const [key, relPath] of Object.entries(theme.pageLayouts)) {
      if (relPath) {
        themeLayouts[key] = path.resolve(themeDir, relPath);
      }
    }
    fullConfigForPlugins.themeLayouts = themeLayouts;
  }

  // 5. Instantiate plugins from the theme's plugin factories with enhanced error handling
  const themePlugins: RspressPlugin[] = [];
  const strict = cogitaConfig.strict !== false; // Default to true

  if (theme?.plugins) {
    for (const factory of theme.plugins) {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: CogitaPluginConfig 是 Rspress 配置的超集，插件工厂需要接受更丰富的配置
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
