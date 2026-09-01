import { defineConfig } from '@cogita/core';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/lucid/`;

export default defineConfig({
  site: {
    title: 'Field Notes',
    description: '把日常实验、产品观察和代码实践整理成可复用的笔记。',
    base: demoBase,
  },
  theme: '@cogita/theme-lucid',
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
      { text: '首页', link: '/' },
      { text: '文章', link: '/archive' },
      { text: '搜索', link: '/search' },
      { text: '标签', link: '/tags' },
    ],
    lucid: {
      heroEyebrow: 'FIELD NOTES · LUCID DEMO',
      heroCopy: '一个不追赶热点的独立写作空间，记录值得反复回看的实践。',
      postsTitle: '最近记录',
      showSidebar: true,
      featuredPost: '/posts/slow-software',
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
