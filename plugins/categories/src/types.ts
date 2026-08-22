/** 分类文章引用。 */
export interface CategoryPostReference {
  title: string;
  route: string;
  createDate: string;
  updateDate: string;
  description?: string;
  tags?: string[];
  categories?: string[];
}

/** 分类元数据覆盖。 */
export interface CategoryMetadata {
  title?: string;
  description?: string;
}

/** 分类插件配置。 */
export interface CategoriesConfig {
  enabled?: boolean;
  routePrefix?: string;
  separator?: string;
  metadata?: Record<string, CategoryMetadata>;
  excludeCategories?: string[];
  minPostCount?: number;
  sortBy?: 'name' | 'count' | 'date';
}

/** 分类插件的最终配置。 */
export interface ResolvedCategoriesConfig {
  enabled: boolean;
  routePrefix: string;
  separator: string;
  metadata: Record<string, CategoryMetadata>;
  excludeCategories: string[];
  minPostCount: number;
  sortBy: 'name' | 'count' | 'date';
}

/** 分类数据。父分类会聚合所有子分类文章。 */
export interface CategoryData {
  name: string;
  title: string;
  path: string;
  slug: string;
  parentPath?: string;
  depth: number;
  description?: string;
  posts: CategoryPostReference[];
  count: number;
  children: string[];
  route: string;
  createdDate?: string;
  updatedDate?: string;
}

/** 分类统计数据。 */
export interface CategoryStats {
  totalCategories: number;
  rootCategories: number;
  largest?: CategoryData;
  newest?: CategoryData;
  averagePostsPerCategory: number;
}
