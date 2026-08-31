declare module 'virtual-posts-data' {
  export const cogitaVirtualModuleVersion: 1;
  import type { PostFrontmatter } from './types';
  export const contentDataVersion: 1;
  export const allPosts: PostFrontmatter[];
}
