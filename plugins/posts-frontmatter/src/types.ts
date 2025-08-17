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
