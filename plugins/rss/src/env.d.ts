/**
 * 环境类型声明
 */

// 虚拟模块类型声明
declare module 'virtual-posts-data' {
  import type { ContentPost } from '@cogita/shared';
  export const cogitaVirtualModuleVersion: 1;
  export const allPosts: ContentPost[];
}

declare module 'virtual-rss-meta' {
  import type { FeedMeta } from './types';
  export const cogitaVirtualModuleVersion: 1;
  export const feedMeta: FeedMeta;
}
