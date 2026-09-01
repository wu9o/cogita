import { defineConfig } from '@cogita/core';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/editorial/`;

export default defineConfig({
  site: {
    title: 'The Small Systems Review',
    description:
      'An editorial technical journal about small systems, good tools, and long-term thinking.',
    base: demoBase,
  },
  theme: '@cogita/theme-editorial',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md'],
  },
  tags: { enabled: true, routePrefix: 'topics' },
  categories: { enabled: true, routePrefix: 'sections' },
  collections: { enabled: true, routePrefix: 'series' },
  blogList: { enabled: true, routePrefix: 'archive', pageSize: 3 },
  search: { enabled: true, routePrefix: 'search', includeContent: true },
  readingProgress: { enabled: true, showBar: true, showReadingTime: true },
  codeCopy: { enabled: true },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Archive', link: '/archive' },
      { text: 'Series', link: '/series' },
      { text: 'Search', link: '/search' },
    ],
    editorial: {
      heroEyebrow: 'THE SMALL SYSTEMS REVIEW',
      heroCopy: '用专题和叙事，把工程实践中的小问题写成值得保存的长文。',
      featuredPost: '/posts/quiet-tools',
      relatedPosts: { enabled: true, limit: 3 },
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
