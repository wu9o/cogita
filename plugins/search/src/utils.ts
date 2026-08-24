import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import type { ContentIndex } from '@cogita/shared';
import { glob } from 'glob';
import type {
  ResolvedSearchAnalyticsConfig,
  ResolvedSearchConfig,
  SearchConfig,
  SearchDocument,
} from './types';

/** 将搜索页面路由前缀规范化为不带斜杠的形式。 */
export function normalizeRoutePrefix(prefix: string | undefined, fallback: string): string {
  const normalized = (prefix || fallback).trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}

/** 合并默认搜索配置并修正边界值。 */
export function resolveSearchConfig(config?: SearchConfig): ResolvedSearchConfig {
  const fields = config?.fields || {};
  const analytics = config?.analytics || {};
  const finiteNumber = (value: number | undefined, fallback: number) =>
    Number.isFinite(value) ? Math.floor(value as number) : fallback;

  const resolvedAnalytics: ResolvedSearchAnalyticsConfig = {
    enabled: analytics.enabled === true,
    eventName: analytics.eventName?.trim() || 'cogita:search',
    includeQuery: analytics.includeQuery === true,
    includeFilters: analytics.includeFilters === true,
  };

  return {
    enabled: config?.enabled !== false,
    routePrefix: normalizeRoutePrefix(config?.routePrefix, 'search'),
    includeContent: config?.includeContent === true,
    maxContentLength: Math.max(0, finiteNumber(config?.maxContentLength, 12_000)),
    maxResults: Math.max(1, finiteNumber(config?.maxResults, 20)),
    minQueryLength: Math.max(1, finiteNumber(config?.minQueryLength, 1)),
    fields: {
      title: fields.title !== false,
      description: fields.description !== false,
      excerpt: fields.excerpt !== false,
      tags: fields.tags !== false,
      categories: fields.categories !== false,
      content: config?.includeContent === true && fields.content !== false,
    },
    analytics: resolvedAnalytics,
  };
}

/** 清洗 Markdown 正文，只保留适合搜索的纯文本。 */
export function cleanMarkdownContent(markdown: string, maxLength: number): string {
  const content = markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[>*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return maxLength > 0 ? content.slice(0, maxLength) : '';
}

function getContent(filePath: string, config: ResolvedSearchConfig): string | undefined {
  if (!config.includeContent || !config.fields.content) return undefined;

  try {
    return cleanMarkdownContent(fs.readFileSync(filePath, 'utf8'), config.maxContentLength);
  } catch (error) {
    console.warn(`[Search Plugin] 读取正文失败：${filePath}`, error);
    return undefined;
  }
}

function toSearchDocument(post: PostFrontmatter, config: ResolvedSearchConfig): SearchDocument {
  return {
    id: post.route,
    title: post.title,
    route: post.route,
    url: post.url || post.route,
    description: config.fields.description ? post.description : undefined,
    excerpt: config.fields.excerpt ? post.excerpt : undefined,
    tags: config.fields.tags ? post.tags : undefined,
    categories: config.fields.categories ? post.categories : undefined,
    content: getContent(post.filePath, config),
    createDate: post.createDate,
    updateDate: post.updateDate,
    image: post.image,
    imageAlt: post.imageAlt,
  };
}

/** 扫描文章并生成搜索文档。 */
export async function extractSearchDocuments(
  postsDir: string,
  cwd: string,
  routePrefix: string,
  extensions: string[],
  config: ResolvedSearchConfig,
  contentIndex?: ContentIndex
): Promise<SearchDocument[]> {
  if (contentIndex) {
    const posts = await contentIndex.getPosts();
    return posts
      .map((post) => toSearchDocument({ ...post, url: post.url || post.route }, config))
      .sort((a, b) => a.route.localeCompare(b.route));
  }

  const normalizedExtensions = extensions.length > 0 ? extensions : ['md', 'mdx'];
  const extensionPattern =
    normalizedExtensions.length > 1
      ? `{${normalizedExtensions.join(',')}}`
      : normalizedExtensions[0];
  const absolutePaths = await glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd,
    nodir: true,
  });

  return absolutePaths
    .map((filePath) => {
      try {
        return getFrontmatterFromFile(filePath, postsDir, routePrefix);
      } catch (error) {
        console.warn(`[Search Plugin] 跳过文件：${filePath}`, error);
        return null;
      }
    })
    .filter((post): post is PostFrontmatter => post !== null)
    .map((post) => toSearchDocument({ ...post, url: post.url || post.route }, config))
    .sort((a, b) => a.route.localeCompare(b.route));
}

/** 为搜索索引生成稳定 hash，便于主题缓存索引实例。 */
export function createSearchIndexHash(documents: SearchDocument[]): string {
  return createHash('sha1').update(JSON.stringify(documents)).digest('hex').slice(0, 16);
}
