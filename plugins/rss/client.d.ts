/**
 * 客户端类型声明
 * 为使用RSS插件的用户提供TypeScript支持
 */

declare module 'virtual-rss-meta' {
  export interface FeedMeta {
    rssUrl?: string;
    atomUrl?: string;
    jsonUrl?: string;
  }

  export const feedMeta: FeedMeta;
}
