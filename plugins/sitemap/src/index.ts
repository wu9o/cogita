export { pluginSitemap } from './plugin';
export type {
  SitemapChangeFrequency,
  SitemapConfig,
  SitemapCustomUrl,
  SitemapEntry,
  SitemapPost,
} from './types';
export {
  createPostEntries,
  createSiteRoot,
  deduplicateEntries,
  generateSitemapXml,
  normalizeBase,
  normalizeLastmod,
  normalizeOutputPath,
  normalizePriority,
  resolveSitemapUrl,
} from './utils';
export { pluginSitemap as default } from './plugin';
