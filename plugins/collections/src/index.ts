/**
 * Collections 插件导出文件
 */

// 导出插件工厂函数
export { pluginCollections } from './plugin';

// 导出类型定义
export type {
  CollectionData,
  CollectionPost,
  CollectionMetadata,
  CollectionsConfig,
  CollectionStats,
} from './types';

// 导出工具函数（高级用法）
export {
  extractCollectionsFromPosts,
  processCollectionsFromPosts,
  calculateCollectionStats,
} from './utils';

// 默认导出
export { pluginCollections as default } from './plugin';
