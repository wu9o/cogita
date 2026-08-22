declare module 'virtual-categories-data' {
  import type {
    CategoryData,
    CategoryPostReference,
    CategoryStats,
    ResolvedCategoriesConfig,
  } from '@cogita/plugin-categories';

  export const allCategories: CategoryData[];
  export const categoryMap: Record<string, CategoryData>;
  export const categoriesConfig: ResolvedCategoriesConfig;
  export const categoryStats: CategoryStats;
  export function getCategoryByPath(path: string): CategoryData | undefined;
  export function getCategoryBySlug(slug: string): CategoryData | undefined;
  export function getPostsByCategory(path: string): CategoryPostReference[];
  export function getCategoryBreadcrumbs(path: string): CategoryData[];
}
