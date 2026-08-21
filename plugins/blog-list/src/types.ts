import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';

export type BlogListSortBy = 'createDate' | 'updateDate' | 'title';
export type BlogListOrder = 'asc' | 'desc';
export type BlogListArchiveGranularity = 'year' | 'month';

/** 文章列表插件配置。 */
export interface BlogListConfig {
  enabled?: boolean;
  routePrefix?: string;
  pageSize?: number;
  sortBy?: BlogListSortBy;
  order?: BlogListOrder;
  generateArchives?: boolean;
  archivePrefix?: string;
  archiveGranularity?: BlogListArchiveGranularity;
}

/** 单个静态文章列表页的数据。 */
export interface BlogListPage {
  page: number;
  totalPages: number;
  posts: PostFrontmatter[];
  route: string;
  previous?: string;
  next?: string;
}

/** 单个时间归档页的数据。 */
export interface BlogArchive {
  key: string;
  label: string;
  count: number;
  posts: PostFrontmatter[];
  route: string;
}

/** 插件内部使用的最终配置。 */
export type ResolvedBlogListConfig = Required<BlogListConfig>;
