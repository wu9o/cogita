import type { ContentPostReference } from '@cogita/shared';

/**
 * 合集内的文章引用（比普通文章引用多 order 字段）
 */
export interface CollectionPost extends ContentPostReference {
  /** 在合集中的序号（从 1 开始） */
  order: number;
}

/**
 * 合集数据结构
 */
export interface CollectionData {
  /** 合集 slug（URL 标识） */
  slug: string;
  /** 合集标题 */
  title: string;
  /** 合集描述 */
  description?: string;
  /** 封面图片路径 */
  cover?: string;
  /** 合集内的文章列表（已按 order 排序） */
  posts: CollectionPost[];
  /** 文章数量 */
  count: number;
  /** 合集页面路由 */
  route: string;
  /** 合集创建时间（首篇文章日期） */
  createdDate?: string;
  /** 合集更新时间（末篇文章日期） */
  updatedDate?: string;
}

/**
 * 合集元数据（用户在配置中声明，按 slug 索引）
 */
export interface CollectionMetadata {
  /** 合集标题 */
  title?: string;
  /** 合集描述 */
  description?: string;
  /** 封面图片路径 */
  cover?: string;
}

/**
 * 合集插件配置
 */
export interface CollectionsConfig {
  /** 是否启用，默认 true */
  enabled?: boolean;
  /** 路由前缀，默认 'collections' */
  routePrefix?: string;
  /** 合集元数据覆盖（按 slug 索引） */
  metadata?: Record<string, CollectionMetadata>;
  /** 排除的合集 slug 列表 */
  excludeCollections?: string[];
  /** 最小文章数阈值，默认 1 */
  minPostCount?: number;
}

/**
 * 合集统计数据
 */
export interface CollectionStats {
  /** 总合集数 */
  totalCollections: number;
  /** 文章最多的合集 */
  largest: CollectionData;
  /** 最新更新的合集 */
  newest: CollectionData;
  /** 平均每个合集的文章数 */
  averagePostsPerCollection: number;
}
