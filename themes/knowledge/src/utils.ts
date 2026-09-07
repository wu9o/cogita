import { getRouteFromPageData, normalizeSiteBase } from '@cogita/shared';
import { t } from 'virtual-cogita-i18n-text';

export interface KnowledgePageData {
  siteData?: {
    base?: string;
    title?: string;
    description?: string;
  };
  page?: {
    routePath?: string;
    pagePath?: string;
  };
}

/** 从页面数据中读取站点根路径。 */
export function getBase(pageData: KnowledgePageData | undefined): string {
  return normalizeSiteBase(pageData?.siteData?.base);
}

/** 从页面数据中读取当前内容路由，兼容静态构建和浏览器运行时。 */
export function getPageRoute(
  pageData: KnowledgePageData | undefined,
  base: string,
  pathname?: string
): string {
  return getRouteFromPageData(pageData, base, pathname);
}

/** 生成带站点 base 的主题链接。 */
export function getHref(base: string, route: string): string {
  return `${base}${route.startsWith('/') ? route : `/${route}`}`;
}

/** 从站点配置读取知识库主题文案。 */
export function getKnowledgeCopy(pageData: KnowledgePageData | undefined) {
  return {
    title: pageData?.siteData?.title || 'Cogita Knowledge Base',
    description:
      pageData?.siteData?.description ||
      'Organize articles, documents, and their connections into an explorable knowledge space.',
    lead: t(
      'knowledge.home.lead',
      'Use one content index to connect articles and documents, so every reading can lead to the next relevant idea.'
    ),
  };
}
