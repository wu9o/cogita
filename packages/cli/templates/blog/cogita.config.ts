import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: '__SITE_TITLE__ 的技术文章与实践记录。',
    lang: 'zh-CN',
    base: '/',
    url: 'http://localhost:3030/',
  },
  theme: '@cogita/theme-lucid',
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
    description: '__SITE_TITLE__ 的订阅源。',
    language: 'zh-CN',
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
      { text: '首页', link: '/' },
      { text: '全部文章', link: '/archive' },
      { text: '搜索', link: '/search' },
      { text: '标签', link: '/tags' },
      { text: '分类', link: '/categories' },
    ],
  },
});
