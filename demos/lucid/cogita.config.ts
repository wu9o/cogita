import { defineConfig } from '@cogita/core';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/lucid/`;

export default defineConfig({
  site: {
    title: 'Field Notes',
    description: 'Reusable notes from daily experiments, product observations, and code practice.',
    base: demoBase,
  },
  theme: '@cogita/theme-lucid',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md'],
  },
  tags: { enabled: true, routePrefix: 'tags' },
  categories: { enabled: true, routePrefix: 'categories' },
  blogList: {
    enabled: true,
    routePrefix: 'archive',
    pageSize: 4,
    generateArchives: true,
    archivePrefix: 'archives',
    archiveGranularity: 'year',
  },
  search: { enabled: true, routePrefix: 'search', includeContent: true },
  readingProgress: { enabled: true, showBar: true, showReadingTime: true },
  codeCopy: { enabled: true },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/archive' },
      { text: 'Search', link: '/search' },
      { text: 'Topics', link: '/tags' },
    ],
    lucid: {
      heroEyebrow: 'FIELD NOTES · LUCID DEMO',
      heroCopy: 'An independent writing space for practices worth returning to.',
      postsTitle: 'Recent notes',
      showSidebar: true,
      featuredPost: '/posts/slow-software',
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
