import type { RspressPlugin, UserConfig } from '@rspress/core';
import type React from 'react';

export const VIRTUAL_CONTENT_DIR = '.cogita_content';

// Export Rspress types for use in themes and plugins
export type { RspressPlugin, UserConfig };

/** 文章级 SEO 覆盖字段。 */
export interface ContentPostSEO {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  author?: string;
}

/** 内容索引中的统一文章数据。 */
export interface ContentPost {
  title: string;
  description?: string;
  excerpt?: string;
  author?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  collection?: string;
  order?: number;
  collectionTitle?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  seo?: ContentPostSEO;
  url: string;
}

/** 构建期共享内容索引。索引采用惰性加载，只有被插件消费时才扫描文章。 */
export interface ContentIndex {
  /** 获取当前构建周期内的文章元数据。 */
  getPosts(): Promise<readonly ContentPost[]>;
  /** 按需读取并缓存单篇文章正文，避免需要全文的插件重复读取文件。 */
  getPostContent?(filePath: string): Promise<string>;
  /** 在重新触发构建期插件钩子前清理缓存。 */
  invalidate?(): void;
}

/**
 * 构建期上下文。
 *
 * 运行时配置与构建期状态曾经全部平铺在插件配置对象上，导致插件只能依赖
 * 一组没有明确边界的内部字段。这个上下文是向后兼容的收口入口，后续新增
 * 构建期能力应优先放在这里，而不是继续扩展插件配置的顶层字段。
 */
export interface CogitaBuildContext {
  /** 站点项目根目录。 */
  root: string;
  /** 当前工作目录，通常与 root 相同。 */
  cwd: string;
  /** 由 core 维护的共享内容索引。 */
  contentIndex?: ContentIndex;
  /** 当前主题提供的布局绝对路径。 */
  themeLayouts?: Record<string, string>;
  /** 是否以严格模式运行构建。 */
  strict?: boolean;
  /** Cogita 框架构建元数据。 */
  framework?: {
    version: string;
    buildTime: string;
  };
}

// Enhanced config type for plugin factory functions
export interface CogitaPluginConfig {
  root: string;
  cwd: string;
  /**
   * 由 core 注入的共享文章索引，避免各插件重复扫描和解析文章。
   * 该字段只存在于构建期插件配置，不会进入浏览器运行时。
   */
  contentIndex?: ContentIndex;
  /**
   * 构建期能力的稳定入口。
   * 顶层字段仍保留，便于旧版第三方插件平滑迁移。
   */
  buildContext?: CogitaBuildContext;
  site?: {
    title?: string;
    description?: string;
    icon?: string;
    base?: string;
    url?: string;
  };
  posts?: {
    dir?: string;
    routePrefix?: string;
    extensions?: string[];
  };
  images?: {
    enabled?: boolean;
    dir?: string;
    extensions?: string[];
    readDimensions?: boolean;
    failOnMissing?: boolean;
    warnOnMissingAlt?: boolean;
  };
  sitemap?: {
    enabled?: boolean;
    path?: string;
    includeHome?: boolean;
    includePosts?: boolean;
    includeBlogList?: boolean;
    includeSearch?: boolean;
    includeCategories?: boolean;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    customUrls?: Array<{
      path: string;
      lastmod?: string;
      changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    }>;
    failOnMissingSiteUrl?: boolean;
  };
  seo?: {
    enabled?: boolean;
    defaultImage?: string;
    defaultImageAlt?: string;
    defaultDescription?: string;
    author?: string;
    robots?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
    includeJsonLd?: boolean;
    audit?: {
      enabled?: boolean;
      failOnError?: boolean;
      reportPath?: string;
      minDescriptionLength?: number;
    };
  };
  markdown?: UserConfig['markdown'];
  mediumZoom?: UserConfig['mediumZoom'];
  rss?: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    formats?: ('rss' | 'atom' | 'json')[];
    maxItems?: number;
    feedPath?: string;
    atomPath?: string;
    jsonPath?: string;
    includeContent?: boolean;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    customFields?: {
      author?: string;
      category?: string;
    };
  };
  tags?: {
    enabled?: boolean;
    routePrefix?: string;
    layout?: string;
    tagTransform?: (tag: string) => string;
    tagCloud?: {
      minFontSize?: number;
      maxFontSize?: number;
      sortBy?: 'name' | 'count' | 'date';
      limit?: number;
    };
    excludeTags?: string[];
    minPostCount?: number;
  };
  collections?: {
    enabled?: boolean;
    routePrefix?: string;
    metadata?: Record<string, { title?: string; description?: string; cover?: string }>;
    excludeCollections?: string[];
    minPostCount?: number;
  };
  categories?: {
    enabled?: boolean;
    routePrefix?: string;
    separator?: string;
    metadata?: Record<string, { title?: string; description?: string }>;
    excludeCategories?: string[];
    minPostCount?: number;
    sortBy?: 'name' | 'count' | 'date';
  };
  readingProgress?: {
    enabled?: boolean;
    showBar?: boolean;
    showReadingTime?: boolean;
    showTocProgress?: boolean;
    rememberPosition?: boolean;
    wordsPerMinute?: number;
    includeCode?: boolean;
  };
  codeCopy?: {
    enabled?: boolean;
    selector?: string;
    buttonLabel?: string;
    selectionLabel?: string;
    languageLabel?: string;
    copiedLabel?: string;
    errorLabel?: string;
    resetDelay?: number;
  };
  comments?: {
    enabled?: boolean;
    provider?: 'giscus' | 'utterances';
    title?: string;
    giscus?: {
      repo?: string;
      repoId?: string;
      category?: string;
      categoryId?: string;
      mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
      term?: string;
      strict?: boolean;
      reactionsEnabled?: boolean;
      emitMetadata?: boolean;
      inputPosition?: 'top' | 'bottom';
      theme?: string;
      lang?: string;
      loading?: 'lazy' | 'eager';
    };
    utterances?: {
      repo?: string;
      issueTerm?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
      term?: string;
      label?: string;
      theme?: string;
    };
  };
  blogList?: {
    enabled?: boolean;
    routePrefix?: string;
    pageSize?: number;
    sortBy?: 'createDate' | 'updateDate' | 'title';
    order?: 'asc' | 'desc';
    generateArchives?: boolean;
    archivePrefix?: string;
    archiveGranularity?: 'year' | 'month';
  };
  search?: {
    enabled?: boolean;
    routePrefix?: string;
    includeContent?: boolean;
    maxContentLength?: number;
    maxResults?: number;
    minQueryLength?: number;
    fields?: {
      title?: boolean;
      description?: boolean;
      excerpt?: boolean;
      tags?: boolean;
      categories?: boolean;
      content?: boolean;
    };
    analytics?: {
      enabled?: boolean;
      eventName?: string;
      includeQuery?: boolean;
      includeFilters?: boolean;
    };
  };
  _framework?: {
    version: string;
    buildTime: string;
  };
  /**
   * 主题布局组件的绝对路径映射（由 core 框架注入，插件可用其作为 addPages 的 filepath）
   * 键名对应 CogitaTheme.pageLayouts 的键，如 home / tag / tagIndex
   */
  themeLayouts?: Record<string, string>;
  strict?: boolean;
  [key: string]: unknown;
}

/** 获取插件配置对应的构建期上下文，并兼容旧版平铺字段。 */
export function getCogitaBuildContext(config: CogitaPluginConfig): CogitaBuildContext {
  if (config.buildContext) {
    return config.buildContext;
  }

  return {
    root: config.root,
    cwd: config.cwd,
    contentIndex: config.contentIndex,
    themeLayouts: config.themeLayouts,
    strict: config.strict,
    framework: config._framework,
  };
}

// 插件工厂函数接收最终配置并返回 Rspress 插件。
export type CogitaPluginFactory = (
  config: CogitaPluginConfig
) => RspressPlugin | RspressPlugin[] | null | undefined;

/** 文章列表页面生成路由时所需的最小文章数据。 */
export interface BlogListRoutePost {
  createDate?: string;
  tags?: string[];
  categories?: string[];
}

/** 文章列表与归档路由配置。 */
export interface BlogListRouteConfig {
  routePrefix?: string;
  pageSize?: number;
  generateArchives?: boolean;
  archivePrefix?: string;
  archiveGranularity?: 'year' | 'month';
  /** 是否包含标签和分类筛选路由，默认包含。 */
  includeFilters?: boolean;
  /** 分类字段使用的层级分隔符。 */
  categorySeparator?: string;
}

/** 文章列表相关路由的类型，供页面生成、SEO 和 sitemap 共享。 */
export type BlogListRouteKind = 'list' | 'filter' | 'archive';

/** 一条带有页面类型的文章列表路由。 */
export interface BlogListRouteEntry {
  route: string;
  kind: BlogListRouteKind;
}

function normalizeRoutePrefix(prefix: string | undefined, fallback: string): string {
  const normalized = (prefix || fallback).trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}

/** 根据文章数量和日期分组结果生成带类型的列表、筛选与归档路由。 */
export function getBlogListRouteEntries(
  posts: readonly BlogListRoutePost[],
  config: BlogListRouteConfig = {}
): BlogListRouteEntry[] {
  const routePrefix = normalizeRoutePrefix(config.routePrefix, 'archive');
  const archivePrefix = normalizeRoutePrefix(config.archivePrefix, 'archives');
  const pageSize = Math.max(
    1,
    Math.floor(Number.isFinite(config.pageSize) ? (config.pageSize as number) : 10)
  );
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const routes: BlogListRouteEntry[] = [
    { route: `/${routePrefix}`, kind: 'list' },
    ...Array.from({ length: totalPages - 1 }, (_, index) => ({
      route: `/${routePrefix}/page/${index + 2}`,
      kind: 'list' as const,
    })),
  ];

  if (config.includeFilters !== false) {
    routes.push(
      ...getBlogListFilterRoutes(posts, config).map((route) => ({ route, kind: 'filter' as const }))
    );
  }

  if (config.generateArchives === false) {
    return routes;
  }

  const granularity = config.archiveGranularity === 'month' ? 'month' : 'year';
  const archiveKeys = new Set<string>();
  for (const post of posts) {
    const match = /^(\d{4})(?:-(\d{2}))?/.exec(post.createDate || '');
    if (!match) continue;
    archiveKeys.add(granularity === 'month' && match[2] ? `${match[1]}-${match[2]}` : match[1]);
  }

  if (archiveKeys.size > 0) {
    routes.push({ route: `/${archivePrefix}`, kind: 'archive' });
    routes.push(
      ...Array.from(archiveKeys)
        .sort((a, b) => b.localeCompare(a))
        .map((key) => ({ route: `/${archivePrefix}/${key}`, kind: 'archive' as const }))
    );
  }

  return routes;
}

/** 根据共享路由契约生成文章列表、筛选与归档路由。 */
export function getBlogListRoutes(
  posts: readonly BlogListRoutePost[],
  config: BlogListRouteConfig = {}
): string[] {
  return getBlogListRouteEntries(posts, config).map((entry) => entry.route);
}

/** 根据文章标签和层级分类生成文章列表筛选路由。 */
export function getBlogListFilterRoutes(
  posts: readonly BlogListRoutePost[],
  config: Pick<BlogListRouteConfig, 'routePrefix' | 'pageSize' | 'categorySeparator'> = {}
): string[] {
  const routePrefix = normalizeRoutePrefix(config.routePrefix, 'archive');
  const pageSize = Math.max(
    1,
    Math.floor(Number.isFinite(config.pageSize) ? (config.pageSize as number) : 10)
  );
  const separator = config.categorySeparator || '/';
  const filterCounts = new Map<string, number>();

  const addFilter = (route: string) => {
    filterCounts.set(route, (filterCounts.get(route) || 0) + 1);
  };

  for (const post of posts) {
    const postTagRoutes = new Set<string>();
    for (const tag of post.tags || []) {
      const slug = generateTagSlug(tag.trim());
      if (slug) postTagRoutes.add(`/${routePrefix}/tag/${slug}`);
    }
    postTagRoutes.forEach(addFilter);

    const postCategoryRoutes = new Set<string>();
    for (const category of post.categories || []) {
      for (const categoryPath of getCategoryPathVariants(category, separator)) {
        const slug = generateCategorySlug(categoryPath, separator);
        if (slug) postCategoryRoutes.add(`/${routePrefix}/category/${slug}`);
      }
    }
    postCategoryRoutes.forEach(addFilter);
  }

  return Array.from(filterCounts.entries())
    .sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
    .flatMap(([route, count]) => [
      route,
      ...Array.from(
        { length: Math.max(0, Math.ceil(count / pageSize) - 1) },
        (_, index) => `${route}/page/${index + 2}`
      ),
    ]);
}

export interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
    /** 标签详情页布局（路由 /tags/:slug） */
    tag?: string;
    /** 标签索引页布局（路由 /tags） */
    tagIndex?: string;
    /** 合集详情页布局（路由 /collections/:slug） */
    collection?: string;
    /** 合集索引页布局（路由 /collections） */
    collectionIndex?: string;
    /** 文章列表页布局（路由 /archive） */
    blogList?: string;
    /** 文章归档页布局（路由 /archives/:key） */
    archive?: string;
    /** 搜索页布局（路由 /search） */
    search?: string;
    /** 分类索引与详情页布局（路由 /categories） */
    category?: string;
    [key: string]: string | undefined;
  };
  globalStyles?: string;
  globalUIComponents?: (string | [string, object])[];
  plugins?: CogitaPluginFactory[];
}

export interface LayoutProps {
  routePath: string;
  config: UserConfig;
  pageData: Record<string, unknown>;
  children?: React.ReactNode;
}

/** 规范化站点 base 路径，统一去掉首尾多余的斜杠。 */
export function normalizeSiteBase(base?: string): string {
  return (base || '').trim().replace(/^\/+/, '/').replace(/\/+$/, '');
}

/** 从浏览器路径中提取不含站点 base 和 .html 后缀的主题路由。 */
export function getRouteFromPathname(pathname: string, base = ''): string {
  const normalizedBase = normalizeSiteBase(base);
  const normalizedPathname = pathname || '/';
  const withoutBase =
    normalizedBase &&
    (normalizedPathname === normalizedBase || normalizedPathname.startsWith(`${normalizedBase}/`))
      ? normalizedPathname.slice(normalizedBase.length)
      : normalizedPathname;

  let decodedPath = withoutBase;
  try {
    decodedPath = decodeURIComponent(withoutBase);
  } catch {
    // 路径编码不完整时保留原始路径，避免主题渲染直接失败。
  }

  const route = decodedPath.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
  return route ? `/${route}` : '/';
}

/** 将 ISO 日期格式化为站点统一使用的中文日期。 */
export function formatSiteDate(date: string | undefined): string {
  if (!date) return '未标注日期';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('zh-CN');
}

/**
 * 简单的字符串哈希函数（32 位整数）
 * @param str 输入字符串
 * @returns 哈希值
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * 生成 URL 友好的标签 slug
 * 支持中文字符（保留 \u4e00-\u9fff），其余非字母数字替换为连字符
 * 注意：中文 slug 在 URL 中需 encodeURI，部分路由匹配场景可能有兼容性问题
 * @param tagName 标签名称
 * @returns URL slug；若结果为空则用哈希兜底（如 tag-12345678）
 */
export function generateTagSlug(tagName: string): string {
  return (
    tagName
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || `tag-${Math.abs(hashCode(tagName))}`
  );
}

/** 将分类路径拆分、去空并恢复为稳定的层级表示。 */
export function normalizeCategoryPath(value: string, separator = '/'): string {
  const normalizedSeparator = separator || '/';
  return value
    .split(normalizedSeparator)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join(normalizedSeparator);
}

/** 获取分类路径及其所有父级路径，便于生成层级分类树。 */
export function getCategoryPathVariants(value: string, separator = '/'): string[] {
  const normalizedPath = normalizeCategoryPath(value, separator);
  if (!normalizedPath) return [];

  const normalizedSeparator = separator || '/';
  const segments = normalizedPath.split(normalizedSeparator);
  return segments.map((_, index) => segments.slice(0, index + 1).join(normalizedSeparator));
}

/** 生成分类路径对应的 URL slug。 */
export function generateCategorySlug(value: string, separator = '/'): string {
  const normalizedPath = normalizeCategoryPath(value, separator);
  if (!normalizedPath) return '';

  const normalizedSeparator = separator || '/';
  return normalizedPath.split(normalizedSeparator).map(generateTagSlug).join('/');
}

/** 根据文章分类字段收集所有分类路由，供 SEO 和 sitemap 复用。 */
export function getCategoryRoutes(
  posts: Array<{ categories?: string[] }>,
  config: { routePrefix?: string; separator?: string } = {}
): string[] {
  const routePrefix = (config.routePrefix || 'categories').replace(/^\/+|\/+$/g, '');
  const separator = config.separator || '/';
  const paths = new Set<string>();

  for (const post of posts) {
    for (const category of post.categories || []) {
      for (const path of getCategoryPathVariants(category, separator)) {
        paths.add(path);
      }
    }
  }

  return [...paths]
    .map((path) => `/${routePrefix}/${generateCategorySlug(path, separator)}`)
    .sort((a, b) => a.localeCompare(b));
}
