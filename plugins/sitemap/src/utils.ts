import path from 'node:path';
import type { SitemapChangeFrequency, SitemapEntry, SitemapPost } from './types';

const CHANGE_FREQUENCIES = new Set<SitemapChangeFrequency>([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
]);

/** 将站点 base 规范化为带前后斜杠的路径。 */
export function normalizeBase(base?: string): string {
  if (!base || base === '/') {
    return '/';
  }

  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

/** 将站点地址和 base 合并为站点根地址。 */
export function createSiteRoot(siteUrl: string, siteBase?: string): string {
  const url = new URL(siteUrl);
  const configuredBase = normalizeBase(siteBase);
  const existingPath = normalizeBase(url.pathname);

  if (configuredBase !== '/' && (existingPath === '/' || existingPath === configuredBase)) {
    url.pathname = configuredBase;
  } else {
    url.pathname = existingPath;
  }

  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

/** 将站点路由解析为绝对 URL，也支持自定义外部地址。 */
export function resolveSitemapUrl(siteRoot: string, route: string): string {
  if (/^https?:\/\//i.test(route)) {
    return new URL(route).toString();
  }

  const relativeRoute = route.replace(/^\/+/, '');
  return new URL(relativeRoute, `${siteRoot}/`).toString();
}

/** 规范化日期，保留 YYYY-MM-DD 形式以减少生成文件的无意义变化。 */
export function normalizeLastmod(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? undefined : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** 将权重限制在站点地图规范允许的 0 到 1 范围内。 */
export function normalizePriority(value?: number): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(1, Math.max(0, value));
}

/** 生成文章对应的站点地图条目。 */
export function createPostEntries(
  siteRoot: string,
  posts: SitemapPost[],
  changefreq?: SitemapChangeFrequency,
  priority?: number
): SitemapEntry[] {
  return posts.map((post) => ({
    loc: resolveSitemapUrl(siteRoot, post.route),
    lastmod: normalizeLastmod(post.updateDate),
    changefreq,
    priority: normalizePriority(priority),
  }));
}

/** 删除空字段并按 loc 去重，确保生成的 XML 稳定且合法。 */
export function deduplicateEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const byLocation = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    if (!entry.loc) {
      continue;
    }

    byLocation.set(entry.loc, {
      ...entry,
      lastmod: normalizeLastmod(entry.lastmod),
      priority: normalizePriority(entry.priority),
      changefreq:
        entry.changefreq && CHANGE_FREQUENCIES.has(entry.changefreq) ? entry.changefreq : undefined,
    });
  }

  return [...byLocation.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}

/** 转义 XML 文本节点中的特殊字符。 */
export function escapeXml(value: string): string {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[character] ?? character
  );
}

/** 生成符合 Sitemap Protocol 0.9 的 XML。 */
export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const fields = [
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
        entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : '',
        entry.priority !== undefined ? `    <priority>${entry.priority.toFixed(2)}</priority>` : '',
      ]
        .filter(Boolean)
        .join('\n');

      return `  <url>\n${fields}\n  </url>`;
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** 校验输出文件路径必须位于构建目录内。 */
export function normalizeOutputPath(outputPath = 'sitemap.xml'): string {
  const normalized = path.posix.normalize(outputPath.replace(/\\/g, '/').replace(/^\/+/, ''));
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`站点地图输出路径必须位于构建目录内：${outputPath}`);
  }

  return normalized;
}
