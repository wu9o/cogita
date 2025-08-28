/**
 * RSS插件类型定义
 */

/**
 * RSS配置接口
 */
export interface RSSConfig {
  // 基础配置
  title: string;
  description: string;
  link: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;

  // 输出配置
  formats?: ('rss' | 'atom' | 'json')[];
  feedPath?: string; // 默认 'rss.xml'
  atomPath?: string; // 默认 'atom.xml'
  jsonPath?: string; // 默认 'feed.json'

  // 内容配置
  maxItems?: number; // 默认 20
  includeContent?: boolean; // 是否包含完整内容，默认false

  // 自定义字段映射
  customFields?: {
    author?: string; // frontmatter字段名
    category?: string;
  };
}

/**
 * RSS项目数据结构
 */
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  author?: string;
  category?: string[];
  content?: string;
}

/**
 * Feed元数据，用于HTML发现
 */
export interface FeedMeta {
  rssUrl?: string;
  atomUrl?: string;
  jsonUrl?: string;
}

/**
 * 完整的RSS配置接口（包含默认值）
 */
export interface RequiredRSSConfig extends Required<Omit<RSSConfig, 'customFields'>> {
  customFields: Required<NonNullable<RSSConfig['customFields']>>;
}

/**
 * JSON Feed规范接口
 */
export interface JSONFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  generator: string;
  items: JSONFeedItem[];
}

/**
 * JSON Feed项目接口
 */
export interface JSONFeedItem {
  id: string;
  title: string;
  content_html: string;
  url: string;
  date_published: string;
  author?: {
    name: string;
  };
  tags?: string[];
}
