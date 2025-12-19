/**
 * Tags 插件导出文件
 */

// 导出主要的插件函数
export { pluginTags } from './plugin';

// 导出类型定义
export type {
  TagData,
  TagsConfig,
  TagCloudConfig,
  PostReference,
  TagStats,
  TagPageData,
} from './types';

// 导出工具函数（高级用法）
export {
  generateTagSlug,
  calculateTagWeight,
  getRelatedTags,
  calculateTagStats,
} from './utils';

// 默认导出主插件函数
export { pluginTags as default } from './plugin';
