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
      pageData?.siteData?.description || '把文章、文档和它们之间的连接组织成可探索的知识空间。',
    lead: t(
      'knowledge.home.lead',
      '用统一内容索引连接文章与文档，让每一次阅读都能自然抵达下一条相关知识。'
    ),
  };
}
