import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: '__SITE_TITLE__ 的长期知识库。',
    base: '/',
    url: 'http://localhost:3030/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
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
      description: '连接文章、手册和长期积累的知识。',
    },
  },
});
