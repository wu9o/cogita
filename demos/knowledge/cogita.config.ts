import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Atlas of Practice',
    description: '把文章、手册和相互连接的线索放进同一个长期知识空间。',
    base: '/demos/knowledge/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md'],
  },
  contentCheck: {
    enabled: true,
    reportPath: 'content-report.json',
    failOnError: true,
    requiredFields: ['title', 'date'],
    checkLinks: true,
  },
  themeConfig: {
    knowledge: {
      title: 'Atlas of Practice',
      description: '一个连接研究、决策与实践的个人知识库。',
    },
  },
  builderConfig: {
    output: { assetPrefix: '/demos/knowledge/' },
  },
});
