import type { ContentEntryKind } from '@cogita/shared';

/** 搜索字段开关。 */
export interface SearchFieldsConfig {
  title?: boolean;
  description?: boolean;
  excerpt?: boolean;
  tags?: boolean;
  categories?: boolean;
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

/** 搜索分析的最终配置。 */
export interface ResolvedSearchAnalyticsConfig {
  enabled: boolean;
  eventName: string;
  includeQuery: boolean;
  includeFilters: boolean;
}

/** 搜索页面派发的分析事件载荷。 */
export interface SearchAnalyticsDetail {
  event: string;
  resultCount: number;
  queryLength: number;
  indexHash: string;
  query?: string;
  filters?: {
    tag?: string;
    category?: string;
  };
}

/** 搜索插件配置。 */
export interface SearchConfig {
  enabled?: boolean;
  routePrefix?: string;
  includeContent?: boolean;
  maxContentLength?: number;
  maxResults?: number;
  minQueryLength?: number;
  fields?: SearchFieldsConfig;
  analytics?: SearchAnalyticsConfig;
}

/** 搜索插件的最终配置。 */
export interface ResolvedSearchConfig {
  enabled: boolean;
  routePrefix: string;
  includeContent: boolean;
  maxContentLength: number;
  maxResults: number;
  minQueryLength: number;
  fields: Required<SearchFieldsConfig>;
  analytics: ResolvedSearchAnalyticsConfig;
}

/** 供主题运行时消费的搜索文档。 */
export interface SearchDocument {
  id: string;
  /** 内容来源类型，便于知识库主题区分文章与文档。 */
  kind?: ContentEntryKind;
  title: string;
  route: string;
  url: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  content?: string;
  createDate: string;
  updateDate: string;
  image?: string;
  imageAlt?: string;
}
