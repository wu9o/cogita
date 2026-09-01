import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  ContentEntryKind,
  ContentSource,
  ContentSourceContext,
  ContentSourceEntry,
} from '@cogita/shared';
import { glob } from 'glob';
import matter from 'gray-matter';

/** 独立 Git 内容目录的创建选项。 */
export interface GitContentSourceOptions {
  /** 相对于站点根目录的内容目录，也可以传绝对路径。目录应由部署流程提前 checkout。 */
  directory: string;
  /** 内容源在站点内的唯一标识；缺省时根据 directory 生成。 */
  id?: string;
  /** 目录内 Markdown 文件统一映射为文章或普通文档，默认是 document。 */
  kind?: ContentEntryKind;
  /** 公开路由前缀；例如 `notes` 会生成 `/notes/...`。 */
  routePrefix?: string;
  /** 扫描的文件扩展名，默认是 md 和 mdx。 */
  extensions?: string[];
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return undefined;
  }
  return value;
}

/** 将路由前缀规范化为不带首尾斜杠的形式。 */
function normalizeRoutePrefix(prefix: string | undefined): string {
  return prefix?.trim().replace(/^[/\\]+|[/\\]+$/g, '') || '';
}

/** 将 Git 内容目录中的相对文件路径映射为站点路由。 */
function getRoute(relativePath: string, routePrefix: string): string {
  const routeWithoutExt = relativePath.replace(/\.(mdx?)$/i, '');
  const baseRoute = routeWithoutExt.replace(/(^|[/\\])index$/i, '');
  const route = [routePrefix, baseRoute].filter(Boolean).join('/');
  return route ? `/${route}` : '/';
}

/** 将目录中的 Markdown 文件转换为统一外部内容条目。 */
async function readEntry(
  filePath: string,
  directory: string,
  options: Required<Pick<GitContentSourceOptions, 'kind'>> & {
    routePrefix: string;
    sourceId: string;
  },
  contentByFilePath: Map<string, string>
): Promise<ContentSourceEntry> {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const stats = await fs.stat(filePath);
  const { data: frontmatter } = matter(fileContent);
  const relativePath = path.relative(directory, filePath).split(path.sep).join('/');
  const route = getRoute(relativePath, options.routePrefix);
  const title =
    typeof frontmatter.title === 'string' && frontmatter.title.trim()
      ? frontmatter.title.trim()
      : path.basename(filePath).replace(/\.(mdx?)$/i, '');
  const createDate =
    typeof frontmatter.date === 'string'
      ? frontmatter.date
      : typeof frontmatter.createDate === 'string'
        ? frontmatter.createDate
        : undefined;
  if (options.kind === 'post' && !createDate) {
    throw new Error(`[Cogita Git Content Source] 文章缺少 date 或 createDate：${filePath}`);
  }

  const fileKey = `source://${options.sourceId}/${relativePath}`;
  contentByFilePath.set(fileKey, fileContent);
  return {
    kind: options.kind,
    title,
    description: typeof frontmatter.description === 'string' ? frontmatter.description : undefined,
    excerpt: typeof frontmatter.excerpt === 'string' ? frontmatter.excerpt : undefined,
    author: typeof frontmatter.author === 'string' ? frontmatter.author : undefined,
    filePath: fileKey,
    route,
    createDate,
    updateDate:
      typeof frontmatter.updateDate === 'string'
        ? frontmatter.updateDate
        : stats.mtime.toISOString(),
    tags: getStringArray(frontmatter.tags),
    categories: getStringArray(frontmatter.categories),
    image: typeof frontmatter.image === 'string' ? frontmatter.image : undefined,
    imageAlt: typeof frontmatter.imageAlt === 'string' ? frontmatter.imageAlt : undefined,
    imageCaption:
      typeof frontmatter.imageCaption === 'string' ? frontmatter.imageCaption : undefined,
    url: route,
  };
}

/** 创建一个读取独立 Git checkout 内容目录的官方 ContentSource。 */
export function createGitContentSource(options: GitContentSourceOptions): ContentSource {
  const directory = options.directory.trim();
  if (!directory) {
    throw new Error('[Cogita Git Content Source] directory 不能为空');
  }

  const id = options.id?.trim() || `git:${directory}`;
  const kind = options.kind || 'document';
  const routePrefix = normalizeRoutePrefix(options.routePrefix);
  const extensions = (options.extensions || ['md', 'mdx'])
    .map((extension) => extension.replace(/^\./, '').trim())
    .filter(Boolean);
  if (extensions.length === 0) {
    throw new Error('[Cogita Git Content Source] extensions 不能为空');
  }

  const contentByFilePath = new Map<string, string>();
  return {
    id,
    async load(context: ContentSourceContext) {
      const absoluteDirectory = path.isAbsolute(directory)
        ? directory
        : path.resolve(context.root, directory);
      const stats = await fs.stat(absoluteDirectory).catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(
          `[Cogita Git Content Source] 读取目录 ${absoluteDirectory} 失败：${reason}`
        );
      });
      if (!stats.isDirectory()) {
        throw new Error(`[Cogita Git Content Source] directory 不是目录：${absoluteDirectory}`);
      }

      contentByFilePath.clear();
      const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];
      const filePaths = await glob(`**/*.${extensionPattern}`, {
        absolute: true,
        cwd: absoluteDirectory,
        nodir: true,
      });
      const entries = await Promise.all(
        filePaths.map((filePath) =>
          readEntry(
            filePath,
            absoluteDirectory,
            { kind, routePrefix, sourceId: id },
            contentByFilePath
          )
        )
      );
      entries.sort((left, right) => left.route.localeCompare(right.route));
      return entries;
    },
    async getContent(entry) {
      const content = contentByFilePath.get(entry.filePath);
      if (content === undefined) {
        throw new Error(`[Cogita Git Content Source] 条目正文不存在：${entry.filePath}`);
      }
      return content;
    },
  };
}

export default createGitContentSource;
