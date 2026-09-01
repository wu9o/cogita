import {
  formatSiteDate,
  getRouteFromPageData,
  getRouteFromPathname,
  normalizeSiteBase,
} from '@cogita/shared';
import { locale } from 'virtual-cogita-i18n-text';

export interface LucidPageData {
  siteData?: {
    base?: string;
    title?: string;
    description?: string;
    themeConfig?: unknown;
  };
  page?: {
    routePath?: string;
    pagePath?: string;
  };
}

export interface LucidThemeConfig {
  heroEyebrow: string;
  heroCopy: string;
  postsTitle: string;
  showSidebar: boolean;
  featuredPost?: string;
}

/** 从页面数据中读取并规范化站点 base 路径。 */
export function getBase(pageData: LucidPageData | undefined): string {
  return normalizeSiteBase(pageData?.siteData?.base);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 从页面数据读取站点信息，避免布局组件写死博客品牌文案。 */
export function getSiteMetadata(pageData: LucidPageData | undefined) {
  return {
    title: pageData?.siteData?.title || 'Cogita',
    description:
      pageData?.siteData?.description || 'A calm space for building, debugging, and thinking.',
  };
}

/** 读取 Lucid 专属配置，并为独立站点提供稳定默认值。 */
export function getLucidConfig(pageData: LucidPageData | undefined): LucidThemeConfig {
  const themeConfig = pageData?.siteData?.themeConfig;
  const lucid = isRecord(themeConfig) && isRecord(themeConfig.lucid) ? themeConfig.lucid : {};
  const site = getSiteMetadata(pageData);

  return {
    heroEyebrow:
      typeof lucid.heroEyebrow === 'string' ? lucid.heroEyebrow : `${site.title} · NOTES`,
    heroCopy:
      typeof lucid.heroCopy === 'string'
        ? lucid.heroCopy
        : 'A clear technical writing space for building, debugging, and sustained thinking.',
    postsTitle: typeof lucid.postsTitle === 'string' ? lucid.postsTitle : 'Latest notes',
    showSidebar: lucid.showSidebar !== false,
    featuredPost: typeof lucid.featuredPost === 'string' ? lucid.featuredPost : undefined,
  };
}

/** 获取当前页面相对于站点 base 的主题路由。 */
export function getCurrentRoute(pathname: string, base: string): string {
  return getRouteFromPathname(pathname, base);
}

/** 优先使用 Rspress 注入的页面路径，保证静态构建阶段也能识别详情页。 */
export function getPageRoute(
  pageData: LucidPageData | undefined,
  base: string,
  pathname?: string
): string {
  return getRouteFromPageData(pageData, base, pathname);
}

/** 格式化 Lucid 页面中展示的日期。 */
export const formatDate = (date: string | undefined): string => formatSiteDate(date, locale);
