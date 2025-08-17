/// <reference types="./dist/types" />

declare module 'virtual-posts-data' {
  import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
  export const allPosts: PostFrontmatter[];
}
