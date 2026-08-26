import type { RspressPlugin, UserConfig } from '@rspress/core';
import type React from 'react';

export const VIRTUAL_CONTENT_DIR = '.cogita_content';

/** 构建上下文公共契约版本，新增不兼容字段时必须递增。 */
export const COGITA_BUILD_CONTEXT_VERSION = 1 as const;

/** 构建期内容索引公共契约版本，新增不兼容字段时必须递增。 */
export const COGITA_CONTENT_INDEX_VERSION = 1 as const;

/** 运行时内容数据契约版本，新增不兼容字段时必须递增。 */
export const COGITA_CONTENT_DATA_VERSION = 1 as const;

/** Cogita 虚拟运行时模块的数据契约版本，新增不兼容字段时必须递增。 */
export const COGITA_VIRTUAL_MODULE_SCHEMA_VERSION = 1 as const;

/** Core 与内置插件共同使用的稳定能力标识。 */
export const COGITA_CAPABILITIES = {
  CONTENT_POSTS: 'content.posts',
} as const;

/** Cogita 公开虚拟运行时模块的稳定模块 ID。 */
export const COGITA_VIRTUAL_MODULE_IDS = {
  POSTS_DATA: 'virtual-posts-data',
  TAGS_DATA: 'virtual-tags-data',
  COLLECTIONS_DATA: 'virtual-collections-data',
  CATEGORIES_DATA: 'virtual-categories-data',
  BLOG_LIST_DATA: 'virtual-blog-list-data',
  SEARCH_DATA: 'virtual-search-data',
  READING_PROGRESS_DATA: 'virtual-reading-progress-data',
  CODE_COPY_DATA: 'virtual-code-copy-data',
  COMMENTS_DATA: 'virtual-comments-data',
  IMAGES_DATA: 'virtual-images-data',
  RSS_META: 'virtual-rss-meta',
} as const;

export type CogitaBuiltinCapability =
  (typeof COGITA_CAPABILITIES)[keyof typeof COGITA_CAPABILITIES];
export type CogitaVirtualModuleId =
  (typeof COGITA_VIRTUAL_MODULE_IDS)[keyof typeof COGITA_VIRTUAL_MODULE_IDS];

/** 为虚拟运行时模块写入统一版本头，供主题和第三方消费者进行兼容性检查。 */
export function createCogitaVirtualModule(
  source: string,
  version: number = COGITA_VIRTUAL_MODULE_SCHEMA_VERSION
): string {
  return `export const cogitaVirtualModuleVersion = ${version};\n${source}`;
}

/** 构建诊断对象的 schema 版本，字段发生不兼容变化时递增。 */
export const COGITA_DIAGNOSTIC_SCHEMA_VERSION = 1 as const;

/** 构建诊断的严重级别。 */
export type CogitaDiagnosticSeverity = 'error' | 'warning';

/** 面向 CLI、CI 和第三方工具消费的稳定构建诊断格式。 */
export interface CogitaDiagnostic {
  schemaVersion: typeof COGITA_DIAGNOSTIC_SCHEMA_VERSION;
  code: string;
  severity: CogitaDiagnosticSeverity;
  message: string;
  source?: string;
  details?: Readonly<Record<string, unknown>>;
}

/** 带有机器可读诊断信息的构建错误。 */
export class CogitaDiagnosticError extends Error {
  readonly diagnostic: CogitaDiagnostic;

  constructor(diagnostic: CogitaDiagnostic, cause?: unknown) {
    super(diagnostic.message);
    this.name = 'CogitaDiagnosticError';
    this.diagnostic = diagnostic;
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

/** 从未知异常中提取稳定诊断，兼容跨包副本导致的 instanceof 失效。 */
export function getCogitaDiagnostic(error: unknown): CogitaDiagnostic | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const diagnostic = (error as { diagnostic?: unknown }).diagnostic;
  if (!diagnostic || typeof diagnostic !== 'object') {
    return undefined;
  }

  const candidate = diagnostic as Partial<CogitaDiagnostic>;
  if (
    candidate.schemaVersion !== COGITA_DIAGNOSTIC_SCHEMA_VERSION ||
    typeof candidate.code !== 'string' ||
    (candidate.severity !== 'error' && candidate.severity !== 'warning') ||
    typeof candidate.message !== 'string'
  ) {
    return undefined;
  }

  return candidate as CogitaDiagnostic;
}

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

/**
 * 面向标签、分类、合集等聚合插件的统一文章引用。
 *
 * 聚合数据不应重复定义自己的文章基础字段；新增字段时由这个契约统一扩展，
 * 这样外部主题可以用同一套类型消费不同聚合插件的数据。
 */
export interface ContentPostReference {
  title: string;
  route: string;
  createDate: string;
  updateDate: string;
  description?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  collection?: string;
  collectionTitle?: string;
  url?: string;
}

/** 内容质量与构建诊断支持检查的 frontmatter 字段。 */
export type ContentCheckField = 'title' | 'description' | 'date' | 'author' | 'imageAlt';

/** 内容诊断问题的可配置处理方式。 */
export type ContentCheckIssueSeverity = 'error' | 'warning' | 'ignore';

/** 内容诊断问题的忽略匹配条件。 */
export interface ContentCheckIgnore {
  /** 精确匹配问题代码。 */
  code?: string;
  /** 精确匹配文章路由。 */
  route?: string;
  /** 精确匹配或后缀匹配源文件路径。 */
  filePath?: string;
}

/** 内容质量与构建诊断配置。 */
export interface ContentCheckConfig {
  /** 是否启用内容诊断。 */
  enabled?: boolean;
  /** 发现错误时是否阻断构建。 */
  failOnError?: boolean;
  /** 构建报告相对于输出目录的路径。 */
  reportPath?: string;
  /** 必须存在的 frontmatter 字段。 */
  requiredFields?: ContentCheckField[];
  /** 是否检查文章中的本地图片引用。 */
  checkImages?: boolean;
  /** 是否检查图片替代文本。 */
  checkImageAlt?: boolean;
  /** 是否检查重复路由。 */
  checkRoutes?: boolean;
  /** 是否检查正文为空的文章。 */
  checkEmptyContent?: boolean;
  /** 是否检查文章中的本地链接。 */
  checkLinks?: boolean;
  /** 按问题代码覆盖默认级别，设置为 ignore 可关闭单条规则。 */
  severity?: Record<string, ContentCheckIssueSeverity>;
  /** 按代码、路由或文件路径忽略特定问题。 */
  ignores?: ContentCheckIgnore[];
}

/** 构建期共享内容索引。索引采用惰性加载，只有被插件消费时才扫描文章。 */
export interface ContentIndex {
  /** 内容索引契约版本，第三方兼容实现可以省略以保持旧版兼容。 */
  readonly contractVersion?: typeof COGITA_CONTENT_INDEX_VERSION;
  /** 获取当前构建周期内的文章元数据。 */
  getPosts(): Promise<readonly ContentPost[]>;
  /** 按需读取并缓存单篇文章正文，避免需要全文的插件重复读取文件。 */
  getPostContent?(filePath: string): Promise<string>;
  /** 在重新触发构建期插件钩子前清理缓存。 */
  invalidate?(): void;
}

/** 构建期日志接口，避免插件直接依赖全局 console。 */
export interface CogitaLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const defaultLogger: CogitaLogger = {
  debug: (message, ...args) => console.debug(message, ...args),
  info: (message, ...args) => console.info(message, ...args),
  warn: (message, ...args) => console.warn(message, ...args),
  error: (message, ...args) => console.error(message, ...args),
};

/** 创建默认的控制台日志实现，供 core 初始化构建上下文。 */
export function createCogitaLogger(): CogitaLogger {
  return defaultLogger;
}

/**
 * 构建期上下文。
 *
 * 运行时配置与构建期状态曾经全部平铺在插件配置对象上，导致插件只能依赖
 * 一组没有明确边界的内部字段。这个上下文是向后兼容的收口入口，后续新增
 * 构建期能力应优先放在这里，而不是继续扩展插件配置的顶层字段。
 */
export interface CogitaBuildContext {
  /** 构建上下文契约版本，第三方兼容实现可以省略以保持旧版兼容。 */
  readonly contractVersion?: typeof COGITA_BUILD_CONTEXT_VERSION;
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
  /** 构建期统一日志出口。 */
  logger?: CogitaLogger;
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
  /** 站点额外注册的插件工厂。 */
  plugins?: CogitaPluginFactory[];
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
  contentCheck?: ContentCheckConfig;
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
    logger: defaultLogger,
    framework: config._framework,
  };
}

/** 插件声明的主题布局需求。插件未被启用时不会产生对应的运行时实例。 */
export interface CogitaPluginLayoutRequirement {
  /** 对应 CogitaTheme.pageLayouts 的键名。 */
  layout: string;
  /** 用于构建错误和警告的可读名称。 */
  label?: string;
  /** 仅在特定配置下才需要该布局。 */
  when?: (config: CogitaPluginConfig) => boolean;
}

/** 插件或主题之间传递的稳定能力标识。建议使用 `领域.能力` 命名。 */
export type CogitaCapability = string;

/** 主题消费的插件能力契约。 */
export interface CogitaThemeCapabilities {
  /** 主题正常渲染所需的能力，缺失时应阻断严格构建。 */
  required?: readonly CogitaCapability[];
  /** 主题可以增强但缺失时仍可工作的能力。 */
  optional?: readonly CogitaCapability[];
}

/** 插件实例的 Cogita 扩展元数据。 */
export interface CogitaPluginMetadata {
  /** 插件启用后必须由主题提供的布局。 */
  requiredLayouts?: CogitaPluginLayoutRequirement[];
  /** 插件实例对外提供的稳定能力标识。 */
  providesCapabilities?: readonly CogitaCapability[];
  /** 插件实例依赖的其他插件能力标识。 */
  requiresCapabilities?: readonly CogitaCapability[];
  /** 运行时模块的注册策略；fallback 仅用于 Core 提供的可覆盖降级实现。 */
  runtimeModulePolicy?: 'fallback';
}

/** 带有 Cogita 构建元数据的 Rspress 插件。 */
export type CogitaPlugin = RspressPlugin & {
  cogita?: CogitaPluginMetadata;
};

// 插件工厂函数接收最终配置并返回 Rspress 插件。
export type CogitaPluginFactory = (
  config: CogitaPluginConfig
) => CogitaPlugin | CogitaPlugin[] | null | undefined;

/** 获取插件可用的统一日志出口，并兼容旧版构建上下文。 */
export function getCogitaLogger(config: CogitaPluginConfig): CogitaLogger {
  return getCogitaBuildContext(config).logger || defaultLogger;
}

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
  /** 主题布局消费的插件能力契约。 */
  capabilities?: CogitaThemeCapabilities;
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

/** Rspress 页面运行时数据中用于识别静态页面的最小结构。 */
export interface CogitaPageData {
  page?: {
    /** 动态页面通过 addPages 注册的最终路由。 */
    routePath?: string;
    /** 页面源文件对应的路径，作为旧版本兼容回退。 */
    pagePath?: string;
  };
}

/**
 * 从静态页面数据中解析主题路由。
 *
 * 构建阶段没有 window.location，必须优先使用 Rspress 注入的 routePath；
 * 浏览器运行时再使用 pathname 作为兼容回退，保证两种渲染阶段得到同一结果。
 */
export function getRouteFromPageData(
  pageData: CogitaPageData | undefined,
  base = '',
  pathname = typeof window === 'undefined' ? '' : window.location.pathname
): string {
  const routePath = pageData?.page?.routePath;
  const pagePath = pageData?.page?.pagePath;
  const resolvedPath =
    typeof routePath === 'string' ? routePath : typeof pagePath === 'string' ? pagePath : pathname;
  return getRouteFromPathname(resolvedPath, base);
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
