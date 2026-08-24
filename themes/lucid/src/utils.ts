import { formatSiteDate, getRouteFromPathname, normalizeSiteBase } from '@cogita/shared';

/** 从页面数据中读取并规范化站点 base 路径。 */
export function getBase(pageData: { siteData?: { base?: string } } | undefined): string {
  return normalizeSiteBase(pageData?.siteData?.base);
}

/** 获取当前页面相对于站点 base 的主题路由。 */
export function getCurrentRoute(pathname: string, base: string): string {
  return getRouteFromPathname(pathname, base);
}

/** 格式化 Lucid 页面中展示的日期。 */
export const formatDate = formatSiteDate;
