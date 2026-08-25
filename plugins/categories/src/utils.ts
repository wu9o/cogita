import {
  createCogitaLogger,
  generateCategorySlug,
  getCategoryPathVariants,
  normalizeCategoryPath,
} from '@cogita/shared';
import type { CogitaLogger, ContentIndex, ContentPost } from '@cogita/shared';
import type {
  CategoriesConfig,
  CategoryData,
  CategoryPostReference,
  CategoryStats,
  ResolvedCategoriesConfig,
} from './types';

/** 规范化分类插件配置。 */
export function resolveCategoriesConfig(config?: CategoriesConfig): ResolvedCategoriesConfig {
  const sortBy = config?.sortBy === 'count' || config?.sortBy === 'date' ? config.sortBy : 'name';
  const separator = config?.separator?.trim() || '/';
  const minPostCount = Number.isFinite(config?.minPostCount)
    ? Math.max(1, Math.floor(config?.minPostCount as number))
    : 1;

  return {
    enabled: config?.enabled !== false,
    routePrefix:
      (config?.routePrefix || 'categories').trim().replace(/^\/+|\/+$/g, '') || 'categories',
    separator,
    metadata: config?.metadata || {},
    excludeCategories: (config?.excludeCategories || [])
      .map((category) => normalizeCategoryPath(category, separator))
      .filter(Boolean),
    minPostCount,
    sortBy,
  };
}

/** 从文章目录提取 frontmatter。 */
export async function extractCategoriesFromPosts(
  _postsDir: string,
  _cwd: string,
  _routePrefix = 'posts',
  _extensions = ['md', 'mdx'],
  contentIndex?: ContentIndex,
  logger: CogitaLogger = createCogitaLogger()
): Promise<ContentPost[]> {
  if (contentIndex) {
    return (await contentIndex.getPosts()).map((post) => ({
      ...post,
      url: post.url || post.route,
    }));
  }

  logger.warn('[Categories Plugin] 未找到共享内容索引，跳过分类数据构建');
  return [];
}

function isExcluded(categoryPath: string, config: ResolvedCategoriesConfig): boolean {
  return config.excludeCategories.some(
    (excluded) =>
      categoryPath === excluded || categoryPath.startsWith(`${excluded}${config.separator}`)
  );
}

function createPostReference(post: ContentPost): CategoryPostReference {
  return {
    title: post.title,
    route: post.route,
    createDate: post.createDate,
    updateDate: post.updateDate,
    description: post.description,
    tags: post.tags,
    categories: post.categories,
  };
}

function compareDate(left?: string, right?: string): number {
  return new Date(left || 0).getTime() - new Date(right || 0).getTime();
}

/** 按分类路径构建扁平树数据，父分类会聚合子分类文章。 */
export function processCategoriesFromPosts(
  postsData: ContentPost[],
  config: ResolvedCategoriesConfig
): { categoriesData: CategoryData[]; categoriesMap: Map<string, CategoryData> } {
  const categoriesMap = new Map<string, CategoryData>();
  const postRoutesByCategory = new Map<string, Set<string>>();

  for (const post of postsData) {
    const postReference = createPostReference(post);
    const categoryPaths = new Set<string>();
    for (const category of post.categories || []) {
      for (const categoryPath of getCategoryPathVariants(category, config.separator)) {
        categoryPaths.add(categoryPath);
      }
    }

    for (const categoryPath of categoryPaths) {
      if (isExcluded(categoryPath, config)) continue;

      const segments = categoryPath.split(config.separator);
      const parentPath =
        segments.length > 1 ? segments.slice(0, -1).join(config.separator) : undefined;
      const metadata = config.metadata[categoryPath];
      const existing = categoriesMap.get(categoryPath);
      const segmentName = segments[segments.length - 1] || categoryPath;
      const category: CategoryData = existing || {
        name: segmentName,
        title: metadata?.title || segmentName,
        path: categoryPath,
        slug: generateCategorySlug(categoryPath, config.separator),
        parentPath,
        depth: segments.length - 1,
        description: metadata?.description,
        posts: [],
        count: 0,
        children: [],
        route: `/${config.routePrefix}/${generateCategorySlug(categoryPath, config.separator)}`,
      };

      if (!existing) categoriesMap.set(categoryPath, category);

      const seenRoutes = postRoutesByCategory.get(categoryPath) || new Set<string>();
      if (!seenRoutes.has(post.route)) {
        seenRoutes.add(post.route);
        category.posts.push(postReference);
      }
      postRoutesByCategory.set(categoryPath, seenRoutes);
    }
  }

  for (const [categoryPath, category] of categoriesMap) {
    if (category.posts.length < config.minPostCount) {
      categoriesMap.delete(categoryPath);
      continue;
    }

    category.posts.sort((a, b) => compareDate(b.updateDate, a.updateDate));
    category.count = category.posts.length;
    category.createdDate = category.posts.reduce(
      (oldest, post) => (compareDate(post.createDate, oldest) < 0 ? post.createDate : oldest),
      category.posts[0]?.createDate
    );
    category.updatedDate = category.posts.reduce(
      (newest, post) => (compareDate(post.updateDate, newest) > 0 ? post.updateDate : newest),
      category.posts[0]?.updateDate
    );
  }

  for (const category of categoriesMap.values()) {
    if (category.parentPath && categoriesMap.has(category.parentPath)) {
      categoriesMap.get(category.parentPath)?.children.push(category.path);
    }
  }

  for (const category of categoriesMap.values()) {
    category.children.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  const categoriesData = Array.from(categoriesMap.values()).sort((a, b) => {
    if (config.sortBy === 'count')
      return b.count - a.count || a.path.localeCompare(b.path, 'zh-CN');
    if (config.sortBy === 'date') {
      return compareDate(b.updatedDate, a.updatedDate) || a.path.localeCompare(b.path, 'zh-CN');
    }
    return a.path.localeCompare(b.path, 'zh-CN');
  });

  return { categoriesData, categoriesMap };
}

/** 计算分类统计数据。 */
export function calculateCategoryStats(categoriesData: CategoryData[]): CategoryStats {
  const roots = categoriesData.filter((category) => !category.parentPath);
  if (categoriesData.length === 0) {
    return {
      totalCategories: 0,
      rootCategories: 0,
      averagePostsPerCategory: 0,
    };
  }

  const largest = categoriesData.reduce((current, category) =>
    category.count > current.count ? category : current
  );
  const newest = categoriesData.reduce((current, category) =>
    compareDate(category.updatedDate, current.updatedDate) > 0 ? category : current
  );

  return {
    totalCategories: categoriesData.length,
    rootCategories: roots.length,
    largest,
    newest,
    averagePostsPerCategory:
      categoriesData.reduce((total, category) => total + category.count, 0) / categoriesData.length,
  };
}
