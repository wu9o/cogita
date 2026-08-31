import path from 'node:path';
import type { CogitaLogger, ContentIndex, ContentPost } from '@cogita/shared';
import type { ContentRelationEntry, ContentRelationLink, ContentRelationNode } from './types';

export interface MarkdownLink {
  label: string;
  href: string;
}

/** 移除 fenced code，避免代码示例中的链接被误认为内容关系。 */
function removeFencedCode(markdown: string): string {
  return markdown.replace(/(^|\n)\s*(```|~~~)[^\n]*\n[\s\S]*?\n\s*\2\s*(?=\n|$)/g, '$1');
}

/** 提取标准 Markdown 文本链接，忽略图片、代码块和外部链接。 */
export function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  const source = removeFencedCode(markdown);
  const pattern = /(^|[^\w!])\[([^\]]+)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^)]*["'])?\s*\)/g;

  for (const match of source.matchAll(pattern)) {
    const href = match[3].startsWith('<') ? match[3].slice(1, -1) : match[3];
    if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) || href.startsWith('#')) {
      continue;
    }

    links.push({ label: match[2].trim(), href });
  }

  return links;
}

function normalizeRoute(route: string): string {
  const withoutQuery = route.split(/[?#]/, 1)[0] || '/';
  let decoded = withoutQuery;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    // 路径编码不完整时保留原始值，避免关系索引阻断站点构建。
  }

  const normalized = `/${decoded.replace(/^\/+|\/+$/g, '')}`.replace(/\.html$/i, '');
  return normalized === '/' ? '/' : normalized;
}

function getFileCandidates(filePath: string, extensions: readonly string[]): string[] {
  const normalizedExtensions = extensions.map((extension) =>
    extension.startsWith('.') ? extension : `.${extension}`
  );
  const extension = path.extname(filePath);
  if (extension) {
    return [filePath, path.join(filePath, 'index.md'), path.join(filePath, 'index.mdx')];
  }

  return [
    filePath,
    ...normalizedExtensions.map((item) => `${filePath}${item}`),
    ...normalizedExtensions.map((item) => path.join(filePath, `index${item}`)),
  ];
}

function createPostMaps(posts: readonly ContentPost[], extensions: readonly string[]) {
  const routeMap = new Map(posts.map((post) => [normalizeRoute(post.route), post]));
  const fileMap = new Map<string, ContentPost>();

  for (const post of posts) {
    for (const candidate of getFileCandidates(post.filePath, extensions)) {
      fileMap.set(path.normalize(candidate), post);
    }
  }

  return { routeMap, fileMap };
}

type PostMaps = ReturnType<typeof createPostMaps>;

function resolvePost(
  source: ContentPost,
  href: string,
  maps: PostMaps,
  postsDir: string,
  extensions: readonly string[]
): ContentPost | undefined {
  const target = href.split(/[?#]/, 1)[0];
  if (!target) return undefined;

  if (target.startsWith('/')) {
    return maps.routeMap.get(normalizeRoute(target));
  }

  const absoluteTarget = path.resolve(path.dirname(source.filePath), target);
  const fileTarget = getFileCandidates(absoluteTarget, extensions).find((candidate) =>
    maps.fileMap.has(path.normalize(candidate))
  );
  if (fileTarget) return maps.fileMap.get(path.normalize(fileTarget));

  const routeTarget = path.posix.join(
    '/',
    path.relative(postsDir, absoluteTarget).split(path.sep).join('/')
  );
  return maps.routeMap.get(normalizeRoute(routeTarget));
}

function toNode(post: ContentPost): ContentRelationNode {
  return {
    title: post.title,
    route: post.route,
    url: post.url || post.route,
    description: post.description,
    tags: post.tags,
  };
}

function toLink(post: ContentPost, href: string, label: string): ContentRelationLink {
  return { ...toNode(post), href, label: label || undefined };
}

/** 从共享内容索引生成出链和反向链接关系。 */
export async function buildContentRelations(
  contentIndex: ContentIndex | undefined,
  options: {
    postsDir: string;
    extensions: readonly string[];
    root: string;
    logger: CogitaLogger;
  }
): Promise<ContentRelationEntry[]> {
  if (!contentIndex?.getPostContent) {
    options.logger.warn('[Content Relations Plugin] 内容索引不支持正文读取，跳过关系构建');
    return [];
  }

  const posts = await contentIndex.getPosts();
  const postsDir = path.resolve(options.root, options.postsDir);
  const postMaps = createPostMaps(posts, options.extensions);
  const relationMap = new Map<string, ContentRelationEntry>();

  for (const post of posts) {
    const outbound = new Map<string, ContentRelationLink>();
    try {
      const content = await contentIndex.getPostContent(post.filePath);
      for (const link of extractMarkdownLinks(content)) {
        const target = resolvePost(post, link.href, postMaps, postsDir, options.extensions);
        if (target && target.route !== post.route) {
          outbound.set(target.route, toLink(target, link.href, link.label));
        }
      }
    } catch (error) {
      options.logger.warn(
        `[Content Relations Plugin] 读取正文失败，已跳过 ${post.filePath}`,
        error
      );
    }

    relationMap.set(post.route, {
      route: post.route,
      outbound: Array.from(outbound.values()).sort((left, right) =>
        left.route.localeCompare(right.route, 'zh-CN')
      ),
      inbound: [],
    });
  }

  for (const source of posts) {
    const entry = relationMap.get(source.route);
    if (!entry) continue;

    for (const target of entry.outbound) {
      const targetEntry = relationMap.get(target.route);
      if (targetEntry) {
        targetEntry.inbound.push(toLink(source, target.href, target.label || ''));
      }
    }
  }

  for (const entry of relationMap.values()) {
    entry.inbound.sort((left, right) => left.route.localeCompare(right.route, 'zh-CN'));
  }

  const relations = Array.from(relationMap.values()).sort((left, right) =>
    left.route.localeCompare(right.route, 'zh-CN')
  );
  options.logger.info(`[Content Relations Plugin] 已生成 ${relations.length} 篇内容的关系数据`);
  return relations;
}
