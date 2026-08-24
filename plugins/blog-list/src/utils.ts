import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import {
  generateCategorySlug,
  generateTagSlug,
  getCategoryPathVariants,
  normalizeCategoryPath,
} from '@cogita/shared';
import type { ContentIndex } from '@cogita/shared';
import { glob } from 'glob';
import type {
  BlogArchive,
  BlogListConfig,
  BlogListFilter,
  BlogListPage,
  ResolvedBlogListConfig,
} from './types';

/** 将路由前缀规范化为不带斜杠的形式。 */
export function normalizeRoutePrefix(prefix: string | undefined, fallback: string): string {
  const normalized = (prefix || fallback).trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}

/** 合并默认配置并修正不合法的简单输入。 */
export function resolveBlogListConfig(config?: BlogListConfig): ResolvedBlogListConfig {
  const pageSize = Number.isFinite(config?.pageSize) ? Math.floor(config?.pageSize ?? 10) : 10;

  return {
    enabled: config?.enabled !== false,
    routePrefix: normalizeRoutePrefix(config?.routePrefix, 'archive'),
    pageSize: Math.max(1, pageSize),
    sortBy: config?.sortBy ?? 'createDate',
    order: config?.order ?? 'desc',
    generateArchives: config?.generateArchives !== false,
    archivePrefix: normalizeRoutePrefix(config?.archivePrefix, 'archives'),
    archiveGranularity: config?.archiveGranularity ?? 'year',
  };
}

function getFilterRoute(config: ResolvedBlogListConfig, filter: BlogListFilter): string {
  return `/${config.routePrefix}/${filter.kind}/${filter.slug}`;
}

function getPageRoute(
  config: ResolvedBlogListConfig,
  page: number,
  filter?: BlogListFilter
): string {
  const prefix = filter?.route || `/${normalizeRoutePrefix(config.routePrefix, 'archive')}`;
  return page === 1 ? prefix : `${prefix}/page/${page}`;
}

/** 生成标签和分类筛选项，并统计每个筛选项包含的文章数。 */
export function buildFilters(
  posts: PostFrontmatter[],
  config: ResolvedBlogListConfig,
  categorySeparator = '/'
): BlogListFilter[] {
  const filters = new Map<string, BlogListFilter>();

  const addFilter = (kind: BlogListFilter['kind'], value: string, count: number) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) return;

    const slug =
      kind === 'tag'
        ? generateTagSlug(normalizedValue)
        : generateCategorySlug(normalizedValue, categorySeparator);
    const key = `${kind}:${slug}`;
    const current = filters.get(key);
    if (current) {
      current.count += count;
      return;
    }

    const filter: BlogListFilter = {
      key,
      kind,
      value: normalizedValue,
      label: normalizedValue,
      slug,
      count,
      route: '',
    };
    filter.route = getFilterRoute(config, filter);
    filters.set(key, filter);
  };

  for (const post of posts) {
    const postTags = new Set((post.tags || []).map((tag) => tag.trim()).filter(Boolean));
    for (const tag of postTags) addFilter('tag', tag, 1);

    const postCategories = new Set<string>();
    for (const category of post.categories || []) {
      for (const categoryPath of getCategoryPathVariants(category, categorySeparator)) {
        postCategories.add(normalizeCategoryPath(categoryPath, categorySeparator));
      }
    }
    for (const category of postCategories) addFilter('category', category, 1);
  }

  return Array.from(filters.values()).sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === 'tag' ? -1 : 1;
    if (left.count !== right.count) return right.count - left.count;
    return left.label.localeCompare(right.label, 'zh-CN');
  });
}

/** 按筛选项过滤文章，分类筛选会包含其子分类文章。 */
export function filterPosts(
  posts: PostFrontmatter[],
  filter: BlogListFilter,
  categorySeparator = '/'
): PostFrontmatter[] {
  return posts.filter((post) => {
    if (filter.kind === 'tag') {
      return (post.tags || []).some((tag) => generateTagSlug(tag.trim()) === filter.slug);
    }

    return (post.categories || []).some((category) =>
      getCategoryPathVariants(category, categorySeparator).some(
        (categoryPath) => generateCategorySlug(categoryPath, categorySeparator) === filter.slug
      )
    );
  });
}

/** 扫描并解析文章，保持与 posts-frontmatter 相同的路由规则。 */
export async function extractPosts(
  postsDir: string,
  cwd: string,
  routePrefix: string,
  extensions: string[],
  contentIndex?: ContentIndex
): Promise<PostFrontmatter[]> {
  if (contentIndex) {
    return (await contentIndex.getPosts()).map((post) => ({
      ...post,
      url: post.url || post.route,
    }));
  }

  const normalizedExtensions = extensions.length > 0 ? extensions : ['md', 'mdx'];
  const extensionPattern =
    normalizedExtensions.length > 1
      ? `{${normalizedExtensions.join(',')}}`
      : normalizedExtensions[0];
  const absolutePaths = await glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd,
    nodir: true,
  });

  return absolutePaths
    .map((filePath) => {
      try {
        return getFrontmatterFromFile(filePath, postsDir, routePrefix);
      } catch (error) {
        console.warn(`[Blog List Plugin] 跳过文件 ${filePath}:`, error);
        return null;
      }
    })
    .filter((post): post is PostFrontmatter => post !== null)
    .map((post) => ({ ...post, url: post.url || post.route }));
}

function getSortValue(post: PostFrontmatter, sortBy: ResolvedBlogListConfig['sortBy']): string {
  if (sortBy === 'title') return post.title;
  return sortBy === 'updateDate' ? post.updateDate : post.createDate;
}

function getTimeValue(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** 对文章做稳定排序，避免日期相同时构建结果抖动。 */
export function sortPosts(
  posts: PostFrontmatter[],
  config: ResolvedBlogListConfig
): PostFrontmatter[] {
  return posts
    .map((post, index) => ({ post, index }))
    .sort((a, b) => {
      const aValue = getSortValue(a.post, config.sortBy);
      const bValue = getSortValue(b.post, config.sortBy);
      const comparison =
        config.sortBy === 'title'
          ? aValue.localeCompare(bValue, 'zh-CN')
          : getTimeValue(aValue) - getTimeValue(bValue);

      if (comparison !== 0) return config.order === 'asc' ? comparison : -comparison;
      return a.index - b.index;
    })
    .map(({ post }) => post);
}

/** 将文章拆分为静态分页数据。 */
export function paginatePosts(
  posts: PostFrontmatter[],
  config: ResolvedBlogListConfig,
  filter?: BlogListFilter
): BlogListPage[] {
  const totalPages = Math.max(1, Math.ceil(posts.length / config.pageSize));
  const pages: BlogListPage[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const start = (page - 1) * config.pageSize;
    const route = getPageRoute(config, page, filter);
    pages.push({
      page,
      totalPages,
      posts: posts.slice(start, start + config.pageSize),
      route,
      previous: page > 1 ? getPageRoute(config, page - 1, filter) : undefined,
      next: page < totalPages ? getPageRoute(config, page + 1, filter) : undefined,
      filter,
    });
  }

  return pages;
}

function getArchiveKey(date: string, granularity: ResolvedBlogListConfig['archiveGranularity']) {
  const match = /^(\d{4})(?:-(\d{2}))?/.exec(date);
  if (!match) return null;
  return granularity === 'month' && match[2] ? `${match[1]}-${match[2]}` : match[1];
}

/** 按年份或月份生成归档数据。 */
export function buildArchives(
  posts: PostFrontmatter[],
  config: ResolvedBlogListConfig
): { archives: BlogArchive[]; invalidDateCount: number } {
  const groups = new Map<string, PostFrontmatter[]>();
  let invalidDateCount = 0;

  for (const post of posts) {
    const key = getArchiveKey(post.createDate, config.archiveGranularity);
    if (!key) {
      invalidDateCount += 1;
      continue;
    }
    const group = groups.get(key) ?? [];
    group.push(post);
    groups.set(key, group);
  }

  const archives = Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, groupedPosts]) => ({
      key,
      label: config.archiveGranularity === 'month' ? key : `${key} 年`,
      count: groupedPosts.length,
      posts: groupedPosts,
      route: `/${config.archivePrefix}/${key}`,
    }));

  return { archives, invalidDateCount };
}
