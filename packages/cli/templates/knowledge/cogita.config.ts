import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: 'A long-term knowledge base for __SITE_TITLE__.',
    lang: 'en-US',
    base: '/',
    url: 'http://localhost:3030/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md', 'mdx'],
  },
  contentCheck: {
    enabled: true,
    failOnError: false,
    requiredFields: ['title', 'date'],
    checkLinks: true,
  },
  themeConfig: {
    knowledge: {
      title: '__SITE_TITLE__',
      description: 'Connect posts, handbooks, and knowledge accumulated over time.',
    },
  },
});
