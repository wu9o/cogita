/**
 * RSS插件导出文件
 */

// 导出主要的插件函数
export { pluginRSS, createRSSPlugin } from './plugin';

// 导出类型定义
export type {
  RSSConfig,
  RSSItem,
  FeedMeta,
  RequiredRSSConfig,
  JSONFeed,
  JSONFeedItem,
} from './types';

// 导出生成器类（高级用法）
export { RSSGenerator } from './generator';

// 默认导出主插件函数
export { pluginRSS as default } from './plugin';
