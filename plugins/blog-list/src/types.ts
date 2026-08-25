import type { ContentPost } from '@cogita/shared';

export type BlogListSortBy = 'createDate' | 'updateDate' | 'title';
export type BlogListOrder = 'asc' | 'desc';
export type BlogListArchiveGranularity = 'year' | 'month';
export type BlogListFilterKind = 'tag' | 'category';

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

/** 文章列表的标签或分类筛选项。 */
export interface BlogListFilter {
  key: string;
  kind: BlogListFilterKind;
  value: string;
  label: string;
  slug: string;
  count: number;
  route: string;
}

/** 单个静态文章列表页的数据。 */
export interface BlogListPage {
  page: number;
  totalPages: number;
  posts: ContentPost[];
  route: string;
  previous?: string;
  next?: string;
  filter?: BlogListFilter;
}

/** 单个时间归档页的数据。 */
export interface BlogArchive {
  key: string;
  label: string;
  count: number;
  posts: ContentPost[];
  route: string;
}

/** 插件内部使用的最终配置。 */
export type ResolvedBlogListConfig = Required<BlogListConfig>;
