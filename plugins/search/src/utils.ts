import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createCogitaLogger } from '@cogita/shared';
import type { CogitaLogger, ContentEntry, ContentIndex } from '@cogita/shared';
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

function getContent(
  filePath: string,
  config: ResolvedSearchConfig,
  logger: CogitaLogger
): string | undefined {
  if (!config.includeContent || !config.fields.content) return undefined;

  try {
    return cleanMarkdownContent(fs.readFileSync(filePath, 'utf8'), config.maxContentLength);
  } catch (error) {
    logger.warn(`[Search Plugin] 读取正文失败：${filePath}`, error);
    return undefined;
  }
}

function toSearchDocument(
  entry: ContentEntry,
  config: ResolvedSearchConfig,
  logger: CogitaLogger
): SearchDocument {
  return {
    id: entry.route,
    kind: entry.kind,
    title: entry.title,
    route: entry.route,
    url: entry.url || entry.route,
    description: config.fields.description ? entry.description : undefined,
    excerpt: config.fields.excerpt ? entry.excerpt : undefined,
    tags: config.fields.tags ? entry.tags : undefined,
    categories: config.fields.categories ? entry.categories : undefined,
    content: getContent(entry.filePath, config, logger),
    createDate: entry.createDate || entry.updateDate,
    updateDate: entry.updateDate,
    image: entry.image,
    imageAlt: entry.imageAlt,
  };
}

/** 扫描文章并生成搜索文档。 */
export async function extractSearchDocuments(
  _postsDir: string,
  _cwd: string,
  _routePrefix: string,
  _extensions: string[],
  config: ResolvedSearchConfig,
  contentIndex?: ContentIndex,
  logger: CogitaLogger = createCogitaLogger()
): Promise<SearchDocument[]> {
  if (contentIndex) {
    const entries = contentIndex.getEntries
      ? await contentIndex.getEntries()
      : (await contentIndex.getPosts()).map((post) => ({ ...post, kind: 'post' as const }));
    return entries
      .map((entry) => toSearchDocument({ ...entry, url: entry.url || entry.route }, config, logger))
      .sort((a, b) => a.route.localeCompare(b.route));
  }

  logger.warn('[Search Plugin] 未找到共享内容索引，跳过搜索数据构建');
  return [];
}

/** 为搜索索引生成稳定 hash，便于主题缓存索引实例。 */
export function createSearchIndexHash(documents: SearchDocument[]): string {
  return createHash('sha1').update(JSON.stringify(documents)).digest('hex').slice(0, 16);
}
