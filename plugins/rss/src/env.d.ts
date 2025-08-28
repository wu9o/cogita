/**
 * 环境类型声明
 */

// 虚拟模块类型声明
declare module 'virtual-posts-data' {
  import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
  export const allPosts: PostFrontmatter[];
}

declare module 'virtual-rss-meta' {
  import type { FeedMeta } from './types';
  export const feedMeta: FeedMeta;
}
