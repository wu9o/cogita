import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import type { RouteMeta } from '@rspress/shared';
import type { SEOPageMeta } from './types';

/** 将站点 base 规范化为带前后斜杠的路径。 */
export function normalizeBase(base?: string): string {
  if (!base || base === '/') {
    return '/';
  }

  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

/** 创建站点根地址，保留 site.url 中已经存在的部署路径。 */
export function createSiteRoot(siteUrl?: string, siteBase?: string): string | undefined {
  if (!siteUrl) {
    return undefined;
  }

  const url = new URL(siteUrl);
  const configuredBase = normalizeBase(siteBase);
  const existingPath = normalizeBase(url.pathname);
  url.pathname =
    configuredBase !== '/' && (existingPath === '/' || existingPath === configuredBase)
      ? configuredBase
      : existingPath;
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

/** 将路由规范化为可比较的键。 */
export function normalizeRoute(routePath?: string, siteBase?: string): string {
  if (!routePath || routePath === '/') {
    return '/';
  }

  const normalizedRoute = `/${routePath.replace(/^\/+|\/+$/g, '')}`;
  const normalizedBase = normalizeBase(siteBase).replace(/\/$/, '');

  if (
    normalizedBase !== '/' &&
    (normalizedRoute === normalizedBase || normalizedRoute.startsWith(`${normalizedBase}/`))
  ) {
    const routeWithoutBase = normalizedRoute.slice(normalizedBase.length);
    return routeWithoutBase || '/';
  }

  return normalizedRoute;
}

/** 将站点路由或图片路径解析为绝对地址。 */
export function resolveSiteUrl(siteRoot: string | undefined, value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return new URL(value).toString();
  }

  if (!siteRoot) {
    return value.startsWith('/') ? value : `/${value}`;
  }

  return new URL(value.replace(/^\/+/, ''), `${siteRoot}/`).toString();
}

/** 读取可用于 SEO 的文章元数据。 */
export function createPostMeta(
  post: PostFrontmatter,
  siteRoot: string | undefined,
  defaultImage?: string,
  defaultImageAlt?: string,
  defaultAuthor?: string,
  defaultDescription?: string,
  twitterCard?: SEOPageMeta['twitterCard']
): SEOPageMeta {
  const postSeo = post.seo;
  const imageValue = postSeo?.image || post.image || defaultImage;

  return {
    title: postSeo?.title || post.title,
    description:
      postSeo?.description || post.description || post.excerpt || defaultDescription || '',
    canonical: postSeo?.canonical
      ? resolveSiteUrl(siteRoot, postSeo.canonical)
      : siteRoot
        ? resolveSiteUrl(siteRoot, post.route)
        : undefined,
    image: imageValue ? resolveSiteUrl(siteRoot, imageValue) : undefined,
    imageAlt:
      postSeo?.imageAlt ||
      post.imageAlt ||
      (imageValue === defaultImage ? defaultImageAlt : undefined),
    author: postSeo?.author || post.author || defaultAuthor,
    type: 'Article',
    robots: postSeo?.noindex ? 'noindex, nofollow' : 'index, follow',
    twitterCard: twitterCard || (imageValue ? 'summary_large_image' : 'summary'),
    datePublished: post.createDate,
    dateModified: post.updateDate,
  };
}

/** 对 HTML 属性值进行转义，避免 frontmatter 内容破坏生成的 head 标签。 */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character
  );
}

/** 生成安全的 JSON-LD 文本，避免内容提前闭合 script 标签。 */
export function stringifyJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** 生成页面级 SEO head 标签。 */
export function renderSeoHead(meta: SEOPageMeta, includeJsonLd: boolean): string {
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<meta property="og:type" content="${meta.type === 'Article' ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    meta.canonical ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />` : '',
    meta.canonical ? `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />` : '',
    meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}" />` : '',
    meta.imageAlt ? `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />` : '',
    `<meta name="twitter:card" content="${meta.twitterCard}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    meta.image ? `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />` : '',
    meta.author ? `<meta name="author" content="${escapeHtml(meta.author)}" />` : '',
  ].filter(Boolean);

  if (includeJsonLd) {
    tags.push(
      `<script type="application/ld+json">${stringifyJsonLd({
        '@context': 'https://schema.org',
        '@type': meta.type,
        name: meta.title,
        headline: meta.type === 'Article' ? meta.title : undefined,
        description: meta.description,
        url: meta.canonical,
        image: meta.image,
        author: meta.author ? { '@type': 'Person', name: meta.author } : undefined,
        datePublished: meta.datePublished,
        dateModified: meta.dateModified,
      })}</script>`
    );
  }

  return tags.join('');
}

/** 根据路由判断是否为站点首页。 */
export function isHomeRoute(route: RouteMeta, siteBase?: string): boolean {
  return normalizeRoute(route.routePath, siteBase) === '/';
}
