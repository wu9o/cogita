// 客户端虚拟模块类型声明
// 注意：声明必须与 plugin.ts 的 addRuntimeModules 实际导出保持一致
declare module 'virtual-collections-data' {
  import type {
    CollectionData,
    CollectionPost,
    CollectionsConfig,
    CollectionStats,
  } from '@cogita/plugin-collections';

  /** 所有合集数据 */
  export const allCollections: CollectionData[];

  /** 合集映射表（按 slug 索引） */
  export const collectionMap: Record<string, CollectionData>;

  /** 合集配置 */
  export const collectionsConfig: Required<CollectionsConfig>;

  /** 合集统计数据 */
  export const collectionStats: CollectionStats;

  /** 根据 slug 获取合集 */
  export function getCollectionBySlug(slug: string): CollectionData | undefined;

  /** 根据合集 slug 获取文章列表 */
  export function getPostsByCollection(slug: string): CollectionPost[];

  /** 根据文章路由获取它所属的合集 */
  export function getCollectionByPostRoute(route: string): CollectionData | undefined;
}
