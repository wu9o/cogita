import type { ContentPost, ContentPostSEO } from '@cogita/shared';

/** 文章 frontmatter 中的 SEO 覆盖字段。 */
export interface PostSEO extends ContentPostSEO {}

/** 定义文章 Frontmatter 的数据结构。 */
export interface PostFrontmatter extends Omit<ContentPost, 'seo'> {
  /** 文章级 SEO 覆盖字段。 */
  seo?: PostSEO;
}

/**
 * 插件的配置选项接口。
 */
export interface PluginOptions {
  /**
   * 存放文章的目录的绝对路径。
   */
  postsDir: string;
  /**
   * 生成路由时使用的前缀，默认为 'posts'。
   */
  routePrefix?: string;
}
