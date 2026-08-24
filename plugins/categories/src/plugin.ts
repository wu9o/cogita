import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import type { CategoriesConfig, CategoryData, CategoryStats } from './types';
import {
  calculateCategoryStats,
  extractCategoriesFromPosts,
  processCategoriesFromPosts,
  resolveCategoriesConfig,
} from './utils';

/** 创建文章分类插件。 */
export function pluginCategories(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  if (!config.categories || config.categories.enabled === false) {
    logger.info('[Categories Plugin] Categories 配置未启用，跳过分类功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  const finalConfig = resolveCategoriesConfig(config.categories as CategoriesConfig);
  let allCategories: CategoryData[] = [];
  let categoryMap = new Map<string, CategoryData>();
  let categoryStats: CategoryStats = {
    totalCategories: 0,
    rootCategories: 0,
    averagePostsPerCategory: 0,
  };

  return {
    name: '@cogita/plugin-categories',
    cogita: {
      requiredLayouts: [{ layout: 'category', label: '分类' }],
    },

    async beforeBuild() {
      const postsConfig = config.posts || {};
      const posts = await extractCategoriesFromPosts(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        buildContext.contentIndex,
        logger
      );
      const processed = processCategoriesFromPosts(posts, finalConfig);
      allCategories = processed.categoriesData;
      categoryMap = processed.categoriesMap;
      categoryStats = calculateCategoryStats(allCategories);
      logger.info(
        `[Categories Plugin] 成功处理 ${allCategories.length} 个分类，来自 ${posts.length} 篇文章`
      );
    },

    addPages() {
      const categoryLayout = buildContext.themeLayouts?.category;
      if (!categoryLayout) {
        logger.warn('[Categories Plugin] 主题未提供 pageLayouts.category，跳过分类页面生成');
        return [];
      }

      return [
        {
          routePath: `/${finalConfig.routePrefix}`,
          content: '---\npageType: categoryIndex\nsidebar: false\n---',
          filepath: categoryLayout,
        },
        ...allCategories.map((category) => ({
          routePath: category.route,
          content: '---\npageType: category\nsidebar: false\n---',
          filepath: categoryLayout,
        })),
      ];
    },

    addRuntimeModules() {
      return {
        'virtual-categories-data': `
          export const allCategories = ${JSON.stringify(allCategories)};
          export const categoryMap = ${JSON.stringify(Object.fromEntries(categoryMap))};
          export const categoriesConfig = ${JSON.stringify(finalConfig)};
          export const categoryStats = ${JSON.stringify(categoryStats)};

          export function getCategoryByPath(path) {
            return categoryMap[path];
          }

          export function getCategoryBySlug(slug) {
            return allCategories.find(category => category.slug === slug);
          }

          export function getPostsByCategory(path) {
            return categoryMap[path]?.posts || [];
          }

          export function getCategoryBreadcrumbs(path) {
            const breadcrumbs = [];
            let current = categoryMap[path];
            while (current) {
              breadcrumbs.unshift(current);
              current = current.parentPath ? categoryMap[current.parentPath] : undefined;
            }
            return breadcrumbs;
          }
        `,
      };
    },
  };
}

export default pluginCategories;
