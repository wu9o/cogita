import { COGITA_VIRTUAL_MODULE_IDS, createCogitaVirtualModule } from '@cogita/shared';
import type { CogitaPlugin } from '@cogita/shared';

/**
 * 为主题组件提供可选插件的空运行时模块。
 *
 * 可选插件没有启用时，主题仍然会编译对应的布局和全局组件。
 * 统一在 Core 注册默认模块，避免每个主题重复维护一份相同的降级实现。
 */
export const cogitaRuntimeDefaults: CogitaPlugin = {
  name: 'cogita-runtime-defaults',
  cogita: { runtimeModulePolicy: 'fallback' },

  addRuntimeModules() {
    return {
      [COGITA_VIRTUAL_MODULE_IDS.TAGS_DATA]: createCogitaVirtualModule(`
        export const allTags = [];
        export const tagMap = {};
        export const tagsConfig = {
          enabled: false,
          routePrefix: 'tags',
          tagCloud: { minFontSize: 12, maxFontSize: 24, minOpacity: 0.5, maxOpacity: 1, sortBy: 'count', limit: 50 }
        };
        export const tagStats = { totalTags: 0, hottest: null, newest: null, averageTagsPerPost: 0, averagePostsPerTag: 0 };
        export function getTagBySlug() { return undefined; }
        export function getPostsByTag() { return []; }
        export function getRelatedTags() { return []; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.COLLECTIONS_DATA]: createCogitaVirtualModule(`
        export const allCollections = [];
        export const collectionMap = {};
        export const collectionsConfig = { enabled: false, routePrefix: 'collections', metadata: {}, excludeCollections: [], minPostCount: 1 };
        export const collectionStats = { totalCollections: 0, largest: null, newest: null, averagePostsPerCollection: 0 };
        export function getCollectionBySlug() { return undefined; }
        export function getPostsByCollection() { return []; }
        export function getCollectionByPostRoute() { return undefined; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.CATEGORIES_DATA]: createCogitaVirtualModule(`
        export const allCategories = [];
        export const categoryMap = {};
        export const categoriesConfig = { enabled: false, routePrefix: 'categories', separator: '/', metadata: {}, excludeCategories: [], minPostCount: 1, sortBy: 'name' };
        export const categoryStats = { totalCategories: 0, rootCategories: 0, largest: null, newest: null, averagePostsPerCategory: 0 };
        export function getCategoryByPath() { return undefined; }
        export function getCategoryBySlug() { return undefined; }
        export function getPostsByCategory() { return []; }
        export function getCategoryBreadcrumbs() { return []; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.BLOG_LIST_DATA]: createCogitaVirtualModule(`
        export const blogListConfig = { enabled: false, routePrefix: 'archive', pageSize: 10, sortBy: 'createDate', order: 'desc', generateArchives: false, archivePrefix: 'archives', archiveGranularity: 'year' };
        export const allBlogListPages = [];
        export const allBlogListFilters = [];
        export const allArchives = [];
        export function getBlogListPage() { return undefined; }
        export function getBlogListFilter() { return undefined; }
        export function getArchive() { return undefined; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.SEARCH_DATA]: createCogitaVirtualModule(`
        export const searchConfig = {
          enabled: false,
          routePrefix: 'search',
          includeContent: false,
          maxContentLength: 0,
          maxResults: 0,
          minQueryLength: 1,
          fields: { title: true, description: true, excerpt: true, tags: true, categories: true, content: false },
          analytics: { enabled: false, eventName: 'cogita:search', includeQuery: false, includeFilters: false }
        };
        export const searchDocuments = [];
        export const searchIndexHash = '';
      `),
      [COGITA_VIRTUAL_MODULE_IDS.CONTENT_RELATIONS_DATA]: createCogitaVirtualModule(`
        export const contentRelations = [];
        export const relationMap = {};
        export function getContentRelations(route) { return { route, outbound: [], inbound: [] }; }
        export function getBacklinks() { return []; }
        export function getOutgoingLinks() { return []; }
        export function getRelatedContent() { return []; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.READING_PROGRESS_DATA]: createCogitaVirtualModule(`
        export const readingProgressConfig = { enabled: false, showBar: false, showReadingTime: false, showTocProgress: false, rememberPosition: false, wordsPerMinute: 300, includeCode: false };
        export const readingStatsByRoute = {};
        export function getReadingStats() { return undefined; }
      `),
      [COGITA_VIRTUAL_MODULE_IDS.CODE_COPY_DATA]: createCogitaVirtualModule(`
        export const codeCopyConfig = { enabled: false, selector: '.rspress-doc pre', buttonLabel: '复制代码', selectionLabel: '复制选中代码', languageLabel: '复制 {language} 代码', copiedLabel: '已复制', errorLabel: '复制失败', resetDelay: 2000 };
      `),
      [COGITA_VIRTUAL_MODULE_IDS.COMMENTS_DATA]: createCogitaVirtualModule(`
        export const commentsConfig = {
          enabled: false,
          provider: 'giscus',
          title: '评论',
          giscus: { repo: '', repoId: '', category: '', categoryId: '', mapping: 'pathname', term: '', strict: false, reactionsEnabled: false, emitMetadata: false, inputPosition: 'bottom', theme: 'preferred_color_scheme', lang: 'zh-CN', loading: 'lazy' },
          utterances: { repo: '', issueTerm: 'pathname', term: '', label: '', theme: 'github-light' },
          postRoutes: []
        };
      `),
      [COGITA_VIRTUAL_MODULE_IDS.I18N_TEXT]: createCogitaVirtualModule(`
        export const i18nConfig = { enabled: false, locale: 'zh-CN', fallbackLocale: 'zh-CN', messages: {} };
        export const locale = i18nConfig.locale;
        export const fallbackLocale = i18nConfig.fallbackLocale;
        export const messages = i18nConfig.messages;
        export function t(_key, fallback, values) {
          const text = fallback || _key;
          return Object.entries(values || {}).reduce((result, [name, value]) => result.split('{{' + name + '}}').join(String(value)), text);
        }
        export const translate = t;
      `),
    };
  },
};
