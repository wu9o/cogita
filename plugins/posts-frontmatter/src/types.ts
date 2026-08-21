/**
 * 定义文章 Frontmatter 的数据结构。
 */
export interface PostFrontmatter {
  title: string;
  description?: string;
  excerpt?: string;
  author?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  /** 合集 slug（声明文章归属的合集） */
  collection?: string;
  /** 在合集中的排序序号（升序） */
  order?: number;
  /** 合集内的自定义标题（可选，覆盖文章原标题） */
  collectionTitle?: string;
  /** 文章封面路径或外部图片地址 */
  image?: string;
  /** 文章封面替代文本 */
  imageAlt?: string;
  /** 文章封面说明文字 */
  imageCaption?: string;
  /** 文章级 SEO 覆盖字段。 */
  seo?: PostSEO;
  url: string;
}

/** 文章 frontmatter 中的 SEO 覆盖字段。 */
export interface PostSEO {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  author?: string;
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
