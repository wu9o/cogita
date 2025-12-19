/**
 * 标签数据结构
 */
export interface TagData {
  /**
   * 标签名称
   */
  name: string;
  
  /**
   * URL 友好的标签标识
   */
  slug: string;
  
  /**
   * 使用此标签的文章数量
   */
  count: number;
  
  /**
   * 使用此标签的文章列表
   */
  posts: PostReference[];
  
  /**
   * 标签页面路由
   */
  route: string;
}

/**
 * 文章引用（轻量级，避免循环依赖）
 */
export interface PostReference {
  title: string;
  route: string;
  createDate: string;
  updateDate: string;
  description?: string;
  tags?: string[];
}

/**
 * 标签云配置
 */
export interface TagCloudConfig {
  /**
   * 最小字体大小（px）
   * @default 12
   */
  minFontSize?: number;
  
  /**
   * 最大字体大小（px）
   * @default 24
   */
  maxFontSize?: number;
  
  /**
   * 最小透明度
   * @default 0.5
   */
  minOpacity?: number;
  
  /**
   * 最大透明度
   * @default 1.0
   */
  maxOpacity?: number;
  
  /**
   * 排序方式
   * @default 'count'
   */
  sortBy?: 'name' | 'count' | 'date';
  
  /**
   * 显示数量限制
   * @default 50
   */
  limit?: number;
}

/**
 * Tags 插件配置接口
 */
export interface TagsConfig {
  /**
   * 是否启用标签功能
   * @default true
   */
  enabled?: boolean;
  
  /**
   * 标签页面路由前缀
   * @default 'tags'
   */
  routePrefix?: string;
  
  /**
   * 标签云配置
   */
  tagCloud?: TagCloudConfig;
  
  /**
   * 每页显示的文章数量
   * @default 10
   */
  postsPerPage?: number;
  
  /**
   * 标签页面布局
   * @default 'tag'
   */
  layout?: string;
  
  /**
   * 是否为标签生成RSS
   * @default false
   */
  generateRss?: boolean;
  
  /**
   * 标签名称转换函数
   * @default (tag) => tag
   */
  tagTransform?: (tag: string) => string;
  
  /**
   * 忽略的标签列表
   * @default []
   */
  excludeTags?: string[];
  
  /**
   * 最小文章数量阈值（少于此数量的标签将被忽略）
   * @default 1
   */
  minPostCount?: number;
}

/**
 * 标签统计数据
 */
export interface TagStats {
  /**
   * 总标签数量
   */
  totalTags: number;
  
  /**
   * 最热门的标签
   */
  hottest: TagData;
  
  /**
   * 最新的标签（最近使用）
   */
  newest: TagData;
  
  /**
   * 平均每篇文章的标签数
   */
  averageTagsPerPost: number;
  
  /**
   * 平均每个标签的文章数
   */
  averagePostsPerTag: number;
}

/**
 * 标签页面数据
 */
export interface TagPageData {
  tag: TagData;
  currentPage: number;
  totalPages: number;
  posts: PostReference[];
  relatedTags: TagData[];
}
