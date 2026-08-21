import type { CogitaTheme, LayoutProps } from '@cogita/shared';
import type { UserConfig } from '@rspress/core';

export type { CogitaTheme, LayoutProps };

export type ThemeConfig = UserConfig['themeConfig'];
export type BuilderConfig = UserConfig['builderConfig'];
export type MarkdownConfig = UserConfig['markdown'];
export type MediumZoomConfig = UserConfig['mediumZoom'];

export interface SiteConfig {
  title?: string;
  description?: string;
  base?: string;
  url?: string;
}

/**
 * Posts plugin configuration
 */
export interface PostsConfig {
  /**
   * Directory containing posts
   * @default 'posts'
   */
  dir?: string;
  /**
   * Route prefix for posts
   * @default 'posts'
   */
  routePrefix?: string;
  /**
   * File extensions to include
   * @default ['md', 'mdx']
   */
  extensions?: string[];
}

/**
 * Tags plugin configuration
 */
export interface TagsConfig {
  /**
   * Enable tags functionality
   * @default true
   */
  enabled?: boolean;
  /**
   * Route prefix for tag pages
   * @default 'tags'
   */
  routePrefix?: string;
  /**
   * Tag cloud configuration
   */
  tagCloud?: {
    minFontSize?: number;
    maxFontSize?: number;
    minOpacity?: number;
    maxOpacity?: number;
    sortBy?: 'name' | 'count' | 'date';
    limit?: number;
  };
  /**
   * Page layout (reserved for theme layout switching, not yet consumed)
   * @default 'tag'
   */
  layout?: string;
  /**
   * Tag name transformation function
   */
  tagTransform?: (tag: string) => string;
  /**
   * Tags to exclude
   * @default []
   */
  excludeTags?: string[];
  /**
   * Minimum post count threshold
   * @default 1
   */
  minPostCount?: number;
}

/**
 * Collections plugin configuration
 */
export interface CollectionsConfig {
  /**
   * Enable collections functionality
   * @default true
   */
  enabled?: boolean;
  /**
   * Route prefix for collection pages
   * @default 'collections'
   */
  routePrefix?: string;
  /**
   * Collection metadata overrides (indexed by slug)
   */
  metadata?: Record<string, { title?: string; description?: string; cover?: string }>;
  /**
   * Collection slugs to exclude
   * @default []
   */
  excludeCollections?: string[];
  /**
   * Minimum post count threshold
   * @default 1
   */
  minPostCount?: number;
}

export interface RSSConfig {
  /**
   * Feed title
   */
  title: string;
  /**
   * Feed description
   */
  description: string;
  /**
   * Website URL (will fallback to site.url)
   */
  link?: string;
  /**
   * Feed language
   * @default 'en'
   */
  language?: string;
  /**
   * Copyright notice
   */
  copyright?: string;
  /**
   * Managing editor email
   */
  managingEditor?: string;
  /**
   * Webmaster email
   */
  webMaster?: string;
  /**
   * Feed formats to generate
   * @default ['rss']
   */
  formats?: ('rss' | 'atom' | 'json')[];
  /**
   * RSS file path
   * @default 'rss.xml'
   */
  feedPath?: string;
  /**
   * Atom file path
   * @default 'atom.xml'
   */
  atomPath?: string;
  /**
   * JSON feed file path
   * @default 'feed.json'
   */
  jsonPath?: string;
  /**
   * Maximum items in feed
   * @default 20
   */
  maxItems?: number;
  /**
   * Include full content
   * @default false
   */
  includeContent?: boolean;
  /**
   * Custom field mapping
   */
  customFields?: {
    author?: string;
    category?: string;
  };
}

/**
 * 图片插件配置。
 */
export interface ImagesConfig {
  /** 是否启用图片元数据扫描。 */
  enabled?: boolean;
  /** 公共图片目录，相对于项目根目录。 */
  dir?: string;
  /** 扫描的图片扩展名，不含点号。 */
  extensions?: string[];
  /** 是否读取图片尺寸。 */
  readDimensions?: boolean;
  /** 找不到文章封面时是否让构建失败。 */
  failOnMissing?: boolean;
  /** 是否警告文章封面缺少明确的替代文本。 */
  warnOnMissingAlt?: boolean;
}

/** 站点地图支持的更新频率。 */
export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/** 站点地图中的自定义地址。 */
export interface SitemapCustomUrl {
  /** 站点路由或完整的 HTTP(S) 地址。 */
  path: string;
  /** 页面最后更新时间。 */
  lastmod?: string;
  /** 页面更新频率。 */
  changefreq?: SitemapChangeFrequency;
  /** 页面权重，取值范围为 0 到 1。 */
  priority?: number;
}

/** XML 站点地图配置。 */
export interface SitemapConfig {
  /** 是否启用站点地图生成。 */
  enabled?: boolean;
  /** 相对于构建输出目录的文件路径。 */
  path?: string;
  /** 是否包含站点首页。 */
  includeHome?: boolean;
  /** 是否包含文章页面。 */
  includePosts?: boolean;
  /** 是否自动包含文章列表与归档页面。 */
  includeBlogList?: boolean;
  /** 是否自动包含搜索入口页面。 */
  includeSearch?: boolean;
  /** 首页和文章默认使用的更新频率。 */
  changefreq?: SitemapChangeFrequency;
  /** 首页和文章默认使用的权重。 */
  priority?: number;
  /** 额外追加的站点路由。 */
  customUrls?: SitemapCustomUrl[];
  /** 缺少 site.url 时是否让构建失败，默认跟随 strict。 */
  failOnMissingSiteUrl?: boolean;
}

/** Twitter Card 支持的卡片类型。 */
export type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';

/** 页面级 SEO 元数据配置。 */
export interface SEOConfig {
  /** 是否启用 SEO 元数据生成。 */
  enabled?: boolean;
  /** 没有文章封面时使用的默认社交分享图片。 */
  defaultImage?: string;
  /** 默认社交分享图片的替代文本。 */
  defaultImageAlt?: string;
  /** 没有文章摘要时使用的默认描述。 */
  defaultDescription?: string;
  /** 默认作者名称。 */
  author?: string;
  /** 默认 robots 指令。 */
  robots?: string;
  /** Twitter Card 类型。 */
  twitterCard?: TwitterCard;
  /** Twitter/X 站点账号。 */
  twitterSite?: string;
  /** Twitter/X 作者账号。 */
  twitterCreator?: string;
  /** 是否生成 JSON-LD 结构化数据。 */
  includeJsonLd?: boolean;
  /** SEO 审核配置。 */
  audit?: {
    /** 是否启用构建阶段审核。 */
    enabled?: boolean;
    /** 发现错误时是否阻断构建。 */
    failOnError?: boolean;
    /** 相对于构建输出目录的审核报告路径。 */
    reportPath?: string;
    /** 描述少于该长度时输出警告。 */
    minDescriptionLength?: number;
  };
}

/** 文章列表支持的排序字段。 */
export type BlogListSortBy = 'createDate' | 'updateDate' | 'title';

/** 文章列表的排序方向。 */
export type BlogListOrder = 'asc' | 'desc';

/** 归档时间粒度。 */
export type BlogListArchiveGranularity = 'year' | 'month';

/** 文章列表与归档插件配置。 */
export interface BlogListConfig {
  /** 是否启用文章列表功能。 */
  enabled?: boolean;
  /** 文章列表路由前缀。 */
  routePrefix?: string;
  /** 每页文章数量。 */
  pageSize?: number;
  /** 列表排序字段。 */
  sortBy?: BlogListSortBy;
  /** 列表排序方向。 */
  order?: BlogListOrder;
  /** 是否生成归档页面。 */
  generateArchives?: boolean;
  /** 归档页面路由前缀。 */
  archivePrefix?: string;
  /** 归档时间粒度。 */
  archiveGranularity?: BlogListArchiveGranularity;
}

/** 搜索索引字段配置。 */
export interface SearchFieldsConfig {
  /** 是否索引文章标题。 */
  title?: boolean;
  /** 是否索引文章描述。 */
  description?: boolean;
  /** 是否索引文章摘要。 */
  excerpt?: boolean;
  /** 是否索引文章标签。 */
  tags?: boolean;
  /** 是否索引文章分类。 */
  categories?: boolean;
  /** 是否索引清洗后的正文。 */
  content?: boolean;
}

/** 搜索分析配置。 */
export interface SearchAnalyticsConfig {
  /** 是否派发搜索分析事件，默认关闭。 */
  enabled?: boolean;
  /** 浏览器事件和 dataLayer 事件名称。 */
  eventName?: string;
  /** 是否在事件中携带原始搜索词，默认关闭以保护隐私。 */
  includeQuery?: boolean;
  /** 是否在事件中携带标签和分类筛选条件，默认关闭。 */
  includeFilters?: boolean;
}

/** 本地搜索插件配置。 */
export interface SearchConfig {
  /** 是否启用搜索功能。 */
  enabled?: boolean;
  /** 搜索页面路由前缀。 */
  routePrefix?: string;
  /** 是否读取并索引正文。 */
  includeContent?: boolean;
  /** 正文索引的最大字符数。 */
  maxContentLength?: number;
  /** 最多展示的搜索结果数量。 */
  maxResults?: number;
  /** 触发搜索所需的最小查询长度。 */
  minQueryLength?: number;
  /** 搜索字段开关。 */
  fields?: SearchFieldsConfig;
  /** 搜索分析事件配置。 */
  analytics?: SearchAnalyticsConfig;
}

export interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;

  /**
   * Posts plugin configuration
   */
  posts?: PostsConfig;

  /**
   * Tags plugin configuration
   */
  tags?: TagsConfig;

  /**
   * Collections plugin configuration
   */
  collections?: CollectionsConfig;

  /** 文章列表与归档配置。 */
  blogList?: BlogListConfig;

  /** 本地搜索配置。 */
  search?: SearchConfig;

  /**
   * RSS feed configuration
   */
  rss?: RSSConfig;

  /** 图片公共资源与文章封面配置。 */
  images?: ImagesConfig;

  /** XML 站点地图配置。 */
  sitemap?: SitemapConfig;

  /** 页面级 SEO 元数据配置。 */
  seo?: SEOConfig;

  /** Rspress Markdown 配置。 */
  markdown?: MarkdownConfig;

  /** Rspress 原生图片放大配置。 */
  mediumZoom?: MediumZoomConfig;

  /**
   * Rspress theme config
   * @see https://rspress.rs/api/config/config-theme
   */
  themeConfig?: ThemeConfig;

  /**
   * Rspress builder config
   * @see https://rspress.rs/api/config/config-builder
   */
  builderConfig?: BuilderConfig;

  /**
   * Strict mode - fail build on plugin errors
   * @default true
   */
  strict?: boolean;
}

/**
 * Full configuration object passed to plugin factories
 */
export interface CogitaFullConfig extends CogitaConfig {
  root: string;
  cwd: string;
  _framework: {
    version: string;
    buildTime: string;
  };
  /**
   * 主题布局组件的绝对路径映射（由框架注入）
   * 插件可用其作为 addPages 的 filepath，让页面用主题 React 组件渲染
   */
  themeLayouts?: Record<string, string>;
}
