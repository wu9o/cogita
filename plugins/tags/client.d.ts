// 客户端虚拟模块类型声明
// 注意：声明必须与 plugin.ts 的 addRuntimeModules 实际导出保持一致
declare module 'virtual-tags-data' {
  import type { TagData, TagsConfig, PostReference } from '@cogita/plugin-tags';

  /**
   * 所有标签数据
   */
  export const allTags: TagData[];

  /**
   * 标签映射表（按标签名索引）
   */
  export const tagMap: Record<string, TagData>;

  /**
   * 标签配置
   */
  export const tagsConfig: Required<TagsConfig>;

  /**
   * 标签统计数据
   */
  export const tagStats: {
    totalTags: number;
    hottest: TagData;
    newest: TagData;
    averageTagsPerPost: number;
    averagePostsPerTag: number;
  };

  /**
   * 根据 slug 获取标签
   */
  export function getTagBySlug(slug: string): TagData | undefined;

  /**
   * 根据标签名获取文章列表
   */
  export function getPostsByTag(tagName: string): PostReference[];

  /**
   * 获取相关标签
   */
  export function getRelatedTags(currentTag: string, limit?: number): TagData[];
}
