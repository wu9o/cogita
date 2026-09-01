import { defineConfig } from '@cogita/core';
import { createGitContentSource } from '@cogita/plugin-content-source-git';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: '__SITE_TITLE__ 的长期知识库。',
    base: '/',
    url: 'http://localhost:3030/',
  },
  contentDir: 'content',
  contentSources: [
    createGitContentSource({
      id: 'external-notes',
      directory: 'git-content',
      kind: 'document',
      routePrefix: 'notes',
    }),
  ],
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
      description: '连接站点文章、本地手册和独立内容仓库。',
    },
  },
});
