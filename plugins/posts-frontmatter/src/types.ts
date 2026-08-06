/**
 * 定义文章 Frontmatter 的数据结构。
 */
export interface PostFrontmatter {
  title: string;
  description?: string;
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
  url: string;
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
