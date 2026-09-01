import { defineConfig } from '@cogita/core';
import { createGitContentSource } from '@cogita/plugin-content-source-git';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: 'A long-term knowledge base for __SITE_TITLE__.',
    lang: 'en-US',
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
      description: 'Connect site posts, local handbooks, and independent content repositories.',
    },
  },
});
