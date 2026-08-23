import { normalizeHrefInRuntime } from '@rspress/runtime';
import { postCovers } from 'virtual-images-data';

export interface EditorialPost {
  title: string;
  route: string;
  createDate: string;
  updateDate: string;
  description?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  filePath?: string;
}

export interface EditorialThemeConfig {
  heroEyebrow: string;
  heroCopy: string;
  featuredPost?: string;
  relatedPosts: {
    enabled: boolean;
    limit: number;
  };
}

interface EditorialPageData {
  siteData?: {
    base?: string;
    themeConfig?: unknown;
  };
}

export function getBase(pageData: { siteData?: { base?: string } } | undefined): string {
  return (pageData?.siteData?.base || '').replace(/\/$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 读取 Editorial 主题配置，并为缺省字段提供稳定默认值。 */
export function getEditorialConfig(pageData: EditorialPageData | undefined): EditorialThemeConfig {
  const themeConfig = pageData?.siteData?.themeConfig;
  const editorial =
    isRecord(themeConfig) && isRecord(themeConfig.editorial) ? themeConfig.editorial : {};
  const relatedPosts = isRecord(editorial.relatedPosts) ? editorial.relatedPosts : {};
  const configuredLimit = Number(relatedPosts.limit);

  return {
    heroEyebrow:
      typeof editorial.heroEyebrow === 'string' ? editorial.heroEyebrow : 'Cogita · Journal',
    heroCopy:
      typeof editorial.heroCopy === 'string'
        ? editorial.heroCopy
        : '一个内容优先的技术博客，记录构建、调试和持续思考的过程。',
    featuredPost: typeof editorial.featuredPost === 'string' ? editorial.featuredPost : undefined,
    relatedPosts: {
      enabled: relatedPosts.enabled !== false,
      limit: Number.isFinite(configuredLimit)
        ? Math.min(6, Math.max(1, Math.floor(configuredLimit)))
        : 3,
    },
  };
}

export function getRuntimeHref(base: string, route: string): string {
  return normalizeHrefInRuntime(`${base}${route}`);
}

export function formatDate(date: string | undefined): string {
  if (!date) return '未标注日期';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('zh-CN');
}

export function getCurrentRoute(base: string): string {
  if (typeof window === 'undefined') return '/';

  const withoutBase =
    base && window.location.pathname.startsWith(base)
      ? window.location.pathname.slice(base.length)
      : window.location.pathname;

  const route = decodeURIComponent(withoutBase)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.html$/, '');

  return route ? `/${route}` : '/';
}

export function addPostCovers<T extends EditorialPost>(posts: T[]): T[] {
  return posts.map((post) => {
    const cover = postCovers[post.route];
    return cover
      ? {
          ...post,
          image: cover.src,
          imageAlt: cover.alt,
          imageCaption: cover.caption,
          imageWidth: cover.width,
          imageHeight: cover.height,
        }
      : post;
  }) as T[];
}

export function getPostRoute(route: string): string {
  return route.replace(/^\/+/, '');
}
