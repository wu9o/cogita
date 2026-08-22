export { pluginCategories as default, pluginCategories } from './plugin';
export type {
  CategoryData,
  CategoryMetadata,
  CategoryPostReference,
  CategoryStats,
  CategoriesConfig,
  ResolvedCategoriesConfig,
} from './types';
export {
  calculateCategoryStats,
  extractCategoriesFromPosts,
  processCategoriesFromPosts,
  resolveCategoriesConfig,
} from './utils';
