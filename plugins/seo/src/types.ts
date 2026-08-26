import type { CogitaQualityIssue, CogitaQualityReport } from '@cogita/shared';

/** Twitter Card 支持的卡片类型。 */
export type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';

/** 文章 frontmatter 中可覆盖的 SEO 字段。 */
export interface PostSEO {
  /** 搜索结果和社交分享使用的标题。 */
  title?: string;
  /** 搜索结果和社交分享使用的摘要。 */
  description?: string;
  /** 文章规范地址。 */
  canonical?: string;
  /** 社交分享图片。 */
  image?: string;
  /** 社交分享图片替代文本。 */
  imageAlt?: string;
  /** 是否禁止搜索引擎收录文章。 */
  noindex?: boolean;
  /** 文章作者。 */
  author?: string;
}

/** SEO 插件配置。 */
export interface SEOConfig {
  /** 是否启用 SEO 元数据生成。 */
  enabled?: boolean;
  /** 没有文章封面时使用的默认社交分享图片。 */
  defaultImage?: string;
  /** 默认社交分享图片的替代文本。 */
  defaultImageAlt?: string;
  /** 没有文章摘要时使用的默认描述。 */
  defaultDescription?: string;
  /** 默认作者名称。 */
  author?: string;
  /** 默认 robots 指令。 */
  robots?: string;
  /** Twitter Card 类型。 */
  twitterCard?: TwitterCard;
  /** Twitter/X 站点账号。 */
  twitterSite?: string;
  /** Twitter/X 作者账号。 */
  twitterCreator?: string;
  /** 是否生成 JSON-LD 结构化数据。 */
  includeJsonLd?: boolean;
  /** SEO 审核配置。 */
  audit?: SEOAuditConfig;
}

/** SEO 审核工具配置。 */
export interface SEOAuditConfig {
  /** 是否启用构建阶段审核。 */
  enabled?: boolean;
  /** 发现错误时是否阻断构建。 */
  failOnError?: boolean;
  /** 审核报告相对于构建输出目录的路径。 */
  reportPath?: string;
  /** 描述少于该长度时输出警告。 */
  minDescriptionLength?: number;
}

/** SEO 审核问题。 */
export interface SEOAuditIssue extends CogitaQualityIssue {}

/** SEO 审核报告。 */
export interface SEOAuditReport extends CogitaQualityReport {
  reportType: 'seo-audit';
  pageCount: number;
  issues: SEOAuditIssue[];
}

/** SEO 插件内部使用的页面元数据。 */
export interface SEOPageMeta {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  author?: string;
  type: 'WebSite' | 'Article';
  robots: string;
  twitterCard: TwitterCard;
  datePublished?: string;
  dateModified?: string;
}
