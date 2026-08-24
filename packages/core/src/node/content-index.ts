import fs from 'node:fs';
import path from 'node:path';
import type { ContentIndex, ContentPost, ContentPostSEO } from '@cogita/shared';
import { glob } from 'glob';
import matter from 'gray-matter';
import type { PostsConfig } from '../types';

interface ContentIndexOptions {
  root: string;
  posts: Required<Pick<PostsConfig, 'dir' | 'routePrefix' | 'extensions'>>;
}

/** 将文章路由前缀规范化为不带首尾斜杠的形式。 */
function normalizeRoutePrefix(prefix: string): string {
  return prefix.trim().replace(/^[/\\]+|[/\\]+$/g, '') || 'posts';
}

/** 根据文章文件路径生成与 posts 插件一致的公开路由。 */
function getPostRoute(filePath: string, postsDir: string, routePrefix: string): string {
  const relativePath = path.relative(postsDir, filePath);
  const routeWithoutExt = relativePath.replace(/\.(mdx?)$/i, '');
  const baseRoute = routeWithoutExt.replace(/(^|[/\\])index$/i, '');
  const route = path.posix.join(
    normalizeRoutePrefix(routePrefix),
    baseRoute.split(path.sep).join('/')
  );

  return `/${route}`;
}

/** 将 frontmatter 中的 SEO 字段限制为公开数据模型中的字段。 */
function parsePostSEO(value: unknown): ContentPostSEO | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const seo = value as Record<string, unknown>;
  return {
    title: typeof seo.title === 'string' ? seo.title : undefined,
    description: typeof seo.description === 'string' ? seo.description : undefined,
    canonical: typeof seo.canonical === 'string' ? seo.canonical : undefined,
    image: typeof seo.image === 'string' ? seo.image : undefined,
    imageAlt: typeof seo.imageAlt === 'string' ? seo.imageAlt : undefined,
    noindex: typeof seo.noindex === 'boolean' ? seo.noindex : undefined,
    author: typeof seo.author === 'string' ? seo.author : undefined,
  };
}

/** 读取单篇文章的 frontmatter。 */
function readPost(filePath: string, postsDir: string, routePrefix: string): ContentPost | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const { data: frontmatter } = matter(fileContent);
    const fileExt = path.extname(filePath).toLowerCase();

    return {
      title:
        typeof frontmatter.title === 'string'
          ? frontmatter.title
          : path.basename(filePath, fileExt),
      description: frontmatter.description,
      excerpt: frontmatter.excerpt,
      author: frontmatter.author,
      filePath,
      route: getPostRoute(filePath, postsDir, routePrefix),
      createDate: frontmatter.date || frontmatter.createDate || stats.birthtime.toISOString(),
      updateDate: frontmatter.updateDate || stats.mtime.toISOString(),
      categories: frontmatter.categories,
      tags: frontmatter.tags,
      collection: frontmatter.collection,
      order: frontmatter.order,
      collectionTitle: frontmatter.collectionTitle,
      image: frontmatter.image,
      imageAlt: frontmatter.imageAlt,
      imageCaption: frontmatter.imageCaption,
      seo: parsePostSEO(frontmatter.seo),
      url: getPostRoute(filePath, postsDir, routePrefix),
    };
  } catch (error) {
    console.warn(`[Cogita] 解析文章失败，已跳过 ${filePath}:`, error);
    return null;
  }
}

/** 扫描文章并建立共享索引。 */
async function scanPosts(options: ContentIndexOptions): Promise<readonly ContentPost[]> {
  const postsDir = path.resolve(options.root, options.posts.dir);
  const extensions = options.posts.extensions
    .map((extension) => extension.replace(/^\./, '').trim())
    .filter(Boolean);
  const normalizedExtensions = extensions.length > 0 ? extensions : ['md', 'mdx'];
  const extensionPattern =
    normalizedExtensions.length > 1
      ? `{${normalizedExtensions.join(',')}}`
      : normalizedExtensions[0];
  const absolutePaths = await glob(`**/*.${extensionPattern}`, {
    absolute: true,
    cwd: postsDir,
    nodir: true,
  });

  const posts = absolutePaths
    .map((filePath) => readPost(filePath, postsDir, options.posts.routePrefix))
    .filter((post): post is ContentPost => post !== null);

  posts.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

  console.log(`[Cogita] 内容索引已建立，共 ${posts.length} 篇文章`);
  return Object.freeze(posts);
}

/** 创建惰性内容索引，多个插件共享同一个扫描 Promise。 */
export function createContentIndex(
  root: string,
  posts: Required<Pick<PostsConfig, 'dir' | 'routePrefix' | 'extensions'>>
): ContentIndex {
  let postsPromise: Promise<readonly ContentPost[]> | undefined;
  const contentPromises = new Map<string, Promise<string>>();

  return {
    getPosts() {
      postsPromise ??= scanPosts({ root, posts });
      return postsPromise;
    },
    getPostContent(filePath) {
      let contentPromise = contentPromises.get(filePath);
      if (!contentPromise) {
        contentPromise = fs.promises
          .readFile(filePath, 'utf8')
          .then((fileContent) => matter(fileContent).content);
        contentPromises.set(filePath, contentPromise);
      }
      return contentPromise;
    },
    invalidate() {
      postsPromise = undefined;
      contentPromises.clear();
    },
  };
}
