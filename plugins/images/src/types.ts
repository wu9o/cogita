export type ImageSource = 'public' | 'external';

/** 记录图片作为文章封面时的使用关系。 */
export interface ImageUsage {
  src: string;
  count: number;
  postRoutes: string[];
}

/** 暴露给主题和运行时代码的图片数据，不包含本地绝对路径。 */
export interface ImageData {
  src: string;
  relativePath?: string;
  name?: string;
  extension?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  source: ImageSource;
  postRoute?: string;
}

/** 图片插件配置的完整默认值。 */
export interface ResolvedImagesConfig {
  enabled: boolean;
  dir: string;
  extensions: string[];
  readDimensions: boolean;
  failOnMissing: boolean;
  warnOnMissingAlt: boolean;
}

/** 构建阶段使用的图片数据，运行时不会泄漏 filePath。 */
export interface ResolvedImage extends ImageData {
  filePath: string;
}
