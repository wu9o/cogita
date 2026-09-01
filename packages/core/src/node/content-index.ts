import fs from 'node:fs';
import path from 'node:path';
import { COGITA_CONTENT_INDEX_VERSION, createCogitaLogger } from '@cogita/shared';
import type {
  CogitaLogger,
  ContentEntry,
  ContentIndex,
  ContentPost,
  ContentPostSEO,
} from '@cogita/shared';
import { glob } from 'glob';
import matter from 'gray-matter';
import type { PostsConfig } from '../types';

interface ContentIndexOptions {
  root: string;
  posts: Required<Pick<PostsConfig, 'dir' | 'routePrefix' | 'extensions'>>;
  contentDir?: string;
  logger: CogitaLogger;
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

/** 根据文档文件路径生成 contentDir 对应的公开路由。 */
function getDocumentRoute(filePath: string, contentDir: string): string {
  const relativePath = path.relative(contentDir, filePath);
  const routeWithoutExt = relativePath.replace(/\.(mdx?)$/i, '');
  const baseRoute = routeWithoutExt.replace(/(^|[/\\])index$/i, '');
  const route = baseRoute.split(path.sep).join('/');
  return route ? `/${route}` : '/';
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
function readPost(
  filePath: string,
  postsDir: string,
  routePrefix: string,
  logger: CogitaLogger
): ContentPost | null {
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
    logger.warn(`[Cogita] 解析文章失败，已跳过 ${filePath}:`, error);
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
    .map((filePath) => readPost(filePath, postsDir, options.posts.routePrefix, options.logger))
    .filter((post): post is ContentPost => post !== null);

  posts.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

  options.logger.info(`[Cogita] 内容索引已建立，共 ${posts.length} 篇文章`);
  return Object.freeze(posts);
}

/** 将文章映射为统一内容条目，保留文章原有字段和契约。 */
function toContentEntry(post: ContentPost): ContentEntry {
  return {
    ...post,
    kind: 'post',
  };
}

/** 读取普通文档的 frontmatter 和文件元数据。 */
function readDocument(
  filePath: string,
  contentDir: string,
  logger: CogitaLogger
): ContentEntry | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const { data: frontmatter } = matter(fileContent);
    const fileExt = path.extname(filePath).toLowerCase();
    const route = getDocumentRoute(filePath, contentDir);

    return {
      kind: 'document',
      title:
        typeof frontmatter.title === 'string'
          ? frontmatter.title
          : path.basename(filePath, fileExt),
      description:
        typeof frontmatter.description === 'string' ? frontmatter.description : undefined,
      excerpt: typeof frontmatter.excerpt === 'string' ? frontmatter.excerpt : undefined,
      author: typeof frontmatter.author === 'string' ? frontmatter.author : undefined,
      filePath,
      route,
      createDate:
        typeof frontmatter.date === 'string'
          ? frontmatter.date
          : typeof frontmatter.createDate === 'string'
            ? frontmatter.createDate
            : undefined,
      updateDate:
        typeof frontmatter.updateDate === 'string'
          ? frontmatter.updateDate
          : stats.mtime.toISOString(),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : undefined,
      categories: Array.isArray(frontmatter.categories) ? frontmatter.categories : undefined,
      image: typeof frontmatter.image === 'string' ? frontmatter.image : undefined,
      imageAlt: typeof frontmatter.imageAlt === 'string' ? frontmatter.imageAlt : undefined,
      imageCaption:
        typeof frontmatter.imageCaption === 'string' ? frontmatter.imageCaption : undefined,
      url: route,
    };
  } catch (error) {
    logger.warn(`[Cogita] 解析文档失败，已跳过 ${filePath}:`, error);
    return null;
  }
}

/** 扫描 contentDir 下的普通 Markdown 文档。 */
async function scanDocuments(options: ContentIndexOptions): Promise<readonly ContentEntry[]> {
  if (!options.contentDir) {
    return [];
  }

  const contentDir = path.resolve(options.root, options.contentDir);
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
    cwd: contentDir,
    nodir: true,
  });

  const documents = absolutePaths
    .map((filePath) => readDocument(filePath, contentDir, options.logger))
    .filter((entry): entry is ContentEntry => entry !== null);

  documents.sort((left, right) => left.route.localeCompare(right.route, 'zh-CN'));
  return documents;
}

/** 扫描文章和普通文档，建立统一内容条目索引。 */
async function scanEntries(
  options: ContentIndexOptions,
  posts: readonly ContentPost[]
): Promise<readonly ContentEntry[]> {
  const documents = await scanDocuments(options);
  const postPaths = new Set(posts.map((post) => path.normalize(post.filePath)));
  const uniqueDocuments = documents.filter(
    (document) => !postPaths.has(path.normalize(document.filePath))
  );
  const entries = [...posts.map(toContentEntry), ...uniqueDocuments];

  options.logger.info(`[Cogita] 统一内容索引已建立，共 ${entries.length} 个内容条目`);
  return Object.freeze(entries);
}

/** 创建惰性内容索引，多个插件共享同一个扫描 Promise。 */
export function createContentIndex(
  root: string,
  posts: Required<Pick<PostsConfig, 'dir' | 'routePrefix' | 'extensions'>>,
  logger: CogitaLogger = createCogitaLogger(),
  contentDir?: string
): ContentIndex {
  let entriesPromise: Promise<readonly ContentEntry[]> | undefined;
  let postsPromise: Promise<readonly ContentPost[]> | undefined;
  const contentPromises = new Map<string, Promise<string>>();
  const getPosts = () => {
    postsPromise ??= scanPosts({ root, posts, logger });
    return postsPromise;
  };
  const getEntries = () => {
    entriesPromise ??= getPosts().then((postEntries) =>
      scanEntries({ root, posts, contentDir, logger }, postEntries)
    );
    return entriesPromise;
  };

  return {
    contractVersion: COGITA_CONTENT_INDEX_VERSION,
    getPosts,
    getEntries,
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
      entriesPromise = undefined;
      postsPromise = undefined;
      contentPromises.clear();
    },
  };
}
