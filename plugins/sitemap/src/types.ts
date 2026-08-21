/** 站点地图支持的更新频率。 */
export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/** 站点地图中可追加的自定义地址。 */
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

/** 站点地图插件配置。 */
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

/** 站点地图中的一条规范化地址。 */
export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: SitemapChangeFrequency;
  priority?: number;
}

/** 用于生成站点地图的文章最小数据结构。 */
export interface SitemapPost {
  route: string;
  createDate?: string;
  updateDate?: string;
}
