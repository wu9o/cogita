/** 评论服务提供商。 */
export type CommentsProvider = 'giscus' | 'utterances';

/** Giscus 页面与 Discussion 的映射方式。 */
export type GiscusMapping = 'pathname' | 'url' | 'title' | 'og:title' | 'specific';

/** Utterances 页面与 Issue 的映射方式。 */
export type UtterancesIssueTerm = 'pathname' | 'url' | 'title' | 'og:title' | 'specific';

/** Giscus 配置。 */
export interface GiscusConfig {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: GiscusMapping;
  term?: string;
  strict?: boolean;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  theme?: string;
  lang?: string;
  loading?: 'lazy' | 'eager';
}

/** Utterances 配置。 */
export interface UtterancesConfig {
  repo?: string;
  issueTerm?: UtterancesIssueTerm;
  term?: string;
  label?: string;
  theme?: string;
}

/** 评论插件配置。 */
export interface CommentsConfig {
  /** 是否启用评论。默认关闭，避免站点无意间加载第三方脚本。 */
  enabled?: boolean;
  /** 评论服务提供商。 */
  provider?: CommentsProvider;
  /** 文章评论区标题。 */
  title?: string;
  /** Giscus 配置。 */
  giscus?: GiscusConfig;
  /** Utterances 配置。 */
  utterances?: UtterancesConfig;
}

/** 规范化后的 Giscus 配置。 */
export interface ResolvedGiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: GiscusMapping;
  term: string;
  strict: boolean;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: 'top' | 'bottom';
  theme: string;
  lang: string;
  loading: 'lazy' | 'eager';
}

/** 规范化后的 Utterances 配置。 */
export interface ResolvedUtterancesConfig {
  repo: string;
  issueTerm: UtterancesIssueTerm;
  term: string;
  label: string;
  theme: string;
}

/** 评论插件最终注入主题的配置。 */
export interface ResolvedCommentsConfig {
  enabled: boolean;
  provider: CommentsProvider;
  title: string;
  giscus: ResolvedGiscusConfig;
  utterances: ResolvedUtterancesConfig;
  postRoutes: string[];
}
