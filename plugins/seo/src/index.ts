export { pluginSEO } from './plugin';
export type { PostSEO, SEOConfig, SEOPageMeta, TwitterCard } from './types';
export {
  createPostMeta,
  createSiteRoot,
  escapeHtml,
  isHomeRoute,
  normalizeBase,
  normalizeRoute,
  renderSeoHead,
  resolveSiteUrl,
  stringifyJsonLd,
} from './utils';
export { pluginSEO as default } from './plugin';
