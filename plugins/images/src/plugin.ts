import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import { getCogitaBuildContext } from '@cogita/shared';
import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import { glob } from 'glob';
import type { ImageData, ImageUsage, ResolvedImage, ResolvedImagesConfig } from './types';
import {
  createExternalImage,
  isExternalImageSource,
  normalizeImageSrc,
  normalizeImagesConfig,
  readImageDimensions,
  resolvePublicImagePath,
  stripImageSuffix,
  toRuntimeImage,
} from './utils';

function createRuntimeModule(
  allImages: ImageData[],
  postCovers: Record<string, ImageData>,
  imageUsage: Record<string, ImageUsage>
): string {
  return [
    `export const allImages = ${JSON.stringify(allImages)};`,
    `export const postCovers = ${JSON.stringify(postCovers)};`,
    `export const imageUsage = ${JSON.stringify(imageUsage)};`,
    'export function getImageBySrc(src) {',
    '  return allImages.find((image) => image.src === src);',
    '}',
    'export function getPostCover(route) {',
    '  return postCovers[route];',
    '}',
    'export function getUnusedImages() {',
    '  return allImages.filter((image) => !imageUsage[image.src]);',
    '}',
  ].join('\n');
}

async function scanPublicImages(
  root: string,
  imageConfig: ResolvedImagesConfig
): Promise<ResolvedImage[]> {
  const directory = path.resolve(root, imageConfig.dir);
  const extensionPattern =
    imageConfig.extensions.length > 1
      ? `{${imageConfig.extensions.join(',')}}`
      : imageConfig.extensions[0];
  const files = await glob(`**/*.${extensionPattern}`, {
    absolute: true,
    cwd: directory,
    nodir: true,
  });

  return files.map((filePath) => {
    const image = resolvePublicImagePath(root, imageConfig.dir, filePath);
    if (imageConfig.readDimensions) {
      Object.assign(image, readImageDimensions(filePath));
    }
    return image;
  });
}

function getPostCover(
  post: PostFrontmatter,
  imageBySrc: Map<string, ResolvedImage>
): ImageData | null {
  const reference = post.image?.trim();
  if (!reference) {
    return null;
  }

  if (isExternalImageSource(reference)) {
    return createExternalImage(reference, post.imageAlt || post.title, post.imageCaption);
  }

  const source = imageBySrc.get(normalizeImageSrc(reference));
  if (!source) {
    return null;
  }

  return toRuntimeImage(source, {
    alt: post.imageAlt || post.title,
    caption: post.imageCaption,
    postRoute: post.route,
  });
}

async function scanPostFrontmatter(config: CogitaPluginConfig): Promise<PostFrontmatter[]> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex) {
    return (await buildContext.contentIndex.getPosts()).map((post) => ({
      ...post,
      url: post.url || post.route,
    }));
  }

  const postsConfig = config.posts ?? {};
  const postsDir = postsConfig.dir || 'posts';
  const routePrefix = postsConfig.routePrefix || 'posts';
  const extensions = postsConfig.extensions?.length ? postsConfig.extensions : ['md', 'mdx'];
  const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];
  const files = await glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd: buildContext.cwd,
    nodir: true,
  });

  return files
    .map((filePath) => getFrontmatterFromFile(filePath, postsDir, routePrefix))
    .filter((post): post is PostFrontmatter => post !== null);
}

async function copyPublicImages(
  root: string,
  imageDir: string,
  rspressConfig: { outDir?: string; root?: string }
): Promise<void> {
  const sourceDir = path.resolve(root, imageDir);
  const publicRoot = path.resolve(root, 'public');
  const relativeToPublic = path.relative(publicRoot, sourceDir);
  const outputRoot = path.resolve(rspressConfig.root || root, rspressConfig.outDir || 'doc_build');
  const outputDir = path.resolve(outputRoot, relativeToPublic);

  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, outputDir, { recursive: true, force: true });
}

export function pluginImages(config: CogitaPluginConfig): RspressPlugin {
  const buildContext = getCogitaBuildContext(config);
  const imageConfig = normalizeImagesConfig(config);
  let allImages: ImageData[] = [];
  let postCovers: Record<string, ImageData> = {};
  let imageUsage: Record<string, ImageUsage> = {};

  return {
    name: '@cogita/plugin-images',

    async beforeBuild() {
      allImages = [];
      postCovers = {};
      imageUsage = {};

      if (!imageConfig.enabled) {
        return;
      }

      const scannedImages = await scanPublicImages(buildContext.root, imageConfig);
      allImages = scannedImages.map((image) => toRuntimeImage(image));
      const imageBySrc = new Map(
        scannedImages.map((image) => [normalizeImageSrc(stripImageSuffix(image.src)), image])
      );
      const posts = await scanPostFrontmatter(config);
      const missingCovers: string[] = [];
      const missingAlt: string[] = [];

      for (const post of posts) {
        if (post.image && !post.imageAlt?.trim()) {
          missingAlt.push(`${post.route} -> ${post.image}`);
        }

        const cover = getPostCover(post, imageBySrc);
        if (!post.image) {
          continue;
        }
        if (!cover) {
          missingCovers.push(`${post.route} -> ${post.image}`);
          continue;
        }
        postCovers[post.route] = cover;

        const usage = imageUsage[cover.src] ?? {
          src: cover.src,
          count: 0,
          postRoutes: [],
        };
        usage.count += 1;
        usage.postRoutes.push(post.route);
        imageUsage[cover.src] = usage;
      }

      if (missingCovers.length > 0) {
        const message = `[Images Plugin] 找不到文章封面：\n${missingCovers.join('\n')}`;
        if (imageConfig.failOnMissing) {
          throw new Error(message);
        }
        console.warn(message);
      }

      if (imageConfig.warnOnMissingAlt && missingAlt.length > 0) {
        console.warn(`[Images Plugin] 文章封面缺少明确的 alt 文本：\n${missingAlt.join('\n')}`);
      }

      console.log(
        `[Images Plugin] 成功处理 ${allImages.length} 张公共图片，${Object.keys(postCovers).length} 个文章封面，${Object.keys(imageUsage).length} 张图片有封面引用`
      );
    },

    async afterBuild(rspressConfig, isProd) {
      if (!imageConfig.enabled || !isProd || allImages.length === 0) {
        return;
      }
      await copyPublicImages(buildContext.root, imageConfig.dir, rspressConfig);
    },

    addRuntimeModules() {
      return {
        'virtual-images-data': createRuntimeModule(allImages, postCovers, imageUsage),
      };
    },
  };
}
