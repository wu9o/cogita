declare module 'virtual-posts-data' {
  import type { PostFrontmatter } from './types';
  export const contentDataVersion: 1;
  export const allPosts: PostFrontmatter[];
}
