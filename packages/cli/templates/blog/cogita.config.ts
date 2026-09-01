import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: 'Technical writing and practice notes from __SITE_TITLE__.',
    lang: 'en-US',
    base: '/',
    url: 'http://localhost:3030/',
  },
  theme: '@cogita/theme-lucid',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md', 'mdx'],
  },
  tags: {
    enabled: true,
  },
  categories: {
    enabled: true,
  },
  blogList: {
    enabled: true,
    generateArchives: true,
  },
  search: {
    enabled: true,
    includeContent: true,
  },
  rss: {
    title: '__SITE_TITLE__ RSS',
    description: '__SITE_TITLE__ subscription feed.',
    language: 'en-US',
    formats: ['rss', 'atom', 'json'],
  },
  contentCheck: {
    enabled: true,
    failOnError: false,
    requiredFields: ['title', 'date'],
    checkRoutes: true,
    checkEmptyContent: true,
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'All posts', link: '/archive' },
      { text: 'Search', link: '/search' },
      { text: 'Topics', link: '/tags' },
      { text: 'Categories', link: '/categories' },
    ],
  },
});
