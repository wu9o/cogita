import fs from 'node:fs';
import path from 'node:path';
import { createCogitaLogger, getCogitaBuildContext } from '@cogita/shared';
import type { CogitaLogger, CogitaPluginConfig } from '@cogita/shared';
import { imageSize } from 'image-size';
import type { ImageData, ResolvedImage, ResolvedImagesConfig } from './types';

const DEFAULT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'];

/** 统一图片插件配置，避免插件直接依赖未归一化的用户输入。 */
export function normalizeImagesConfig(config: CogitaPluginConfig): ResolvedImagesConfig {
  const buildContext = getCogitaBuildContext(config);
  const configured = config.images ?? {};
  const extensions = configured.extensions?.length ? configured.extensions : DEFAULT_EXTENSIONS;

  return {
    enabled: configured.enabled !== false,
    dir: configured.dir || 'public/images',
    extensions: extensions.map((extension) => extension.replace(/^\./, '').toLowerCase()),
    readDimensions: configured.readDimensions !== false,
    failOnMissing: configured.failOnMissing ?? buildContext.strict !== false,
    warnOnMissingAlt: configured.warnOnMissingAlt === true,
  };
}

/** 将操作系统路径转换为跨平台的 URL 路径。 */
export function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

/** 判断 frontmatter 中的值是否为可直接使用的外部图片地址。 */
export function isExternalImageSource(value: string): boolean {
  return /^(?:https?:|data:|\/\/)/i.test(value);
}

/**
 * 将 public 目录中的文件转换为站点运行时使用的图片数据。
 */
export function toRuntimeImage(
  image: ResolvedImage,
  overrides: Pick<ImageData, 'alt' | 'caption' | 'postRoute'> = {}
): ImageData {
  return {
    src: image.src,
    relativePath: image.relativePath,
    name: image.name,
    extension: image.extension,
    width: image.width,
    height: image.height,
    alt: overrides.alt ?? image.alt,
    caption: overrides.caption ?? image.caption,
    source: image.source,
    postRoute: overrides.postRoute ?? image.postRoute,
  };
}

/**
 * 读取常见图片尺寸。尺寸读取失败不会阻止图片本身被使用。
 */
export function readImageDimensions(
  filePath: string,
  logger: CogitaLogger = createCogitaLogger()
): Pick<ImageData, 'width' | 'height'> {
  try {
    const dimensions = imageSize(fs.readFileSync(filePath));
    return {
      width: typeof dimensions.width === 'number' ? dimensions.width : undefined,
      height: typeof dimensions.height === 'number' ? dimensions.height : undefined,
    };
  } catch (error) {
    logger.warn(`[Images Plugin] 无法读取图片尺寸 ${filePath}:`, error);
    return {};
  }
}

/**
 * 解析公共图片目录，确保图片最终能由 Rspress 的 public 资源规则提供服务。
 */
export function resolvePublicImagePath(root: string, dir: string, filePath: string): ResolvedImage {
  const publicRoot = path.resolve(root, 'public');
  const relativeToPublic = path.relative(publicRoot, filePath);

  if (relativeToPublic.startsWith('..') || path.isAbsolute(relativeToPublic)) {
    throw new Error(`图片目录必须位于 public 目录内：${dir}`);
  }

  const relativePath = toPosixPath(path.relative(root, filePath));
  const src = `/${toPosixPath(relativeToPublic).replace(/^\/+/, '')}`;
  const extension = path.extname(filePath).replace(/^\./, '').toLowerCase();

  return {
    filePath,
    src,
    relativePath,
    name: path.basename(filePath, path.extname(filePath)),
    extension,
    source: 'public',
  };
}

/** 去掉 URL 查询参数和哈希，用于和扫描得到的公共图片建立索引。 */
export function stripImageSuffix(value: string): string {
  return value.split(/[?#]/, 1)[0];
}

/** 从站点绝对路径中规范化出图片索引键。 */
export function normalizeImageSrc(value: string): string {
  const withoutSuffix = stripImageSuffix(value.trim());
  return `/${withoutSuffix.replace(/^\/+/, '')}`;
}

/** 将外部图片地址转换为运行时图片数据。 */
export function createExternalImage(src: string, alt?: string, caption?: string): ImageData {
  return {
    src,
    alt,
    caption,
    source: 'external',
  };
}
