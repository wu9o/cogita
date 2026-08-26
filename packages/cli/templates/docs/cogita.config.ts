import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: '__SITE_TITLE__ 的项目文档。',
    lang: 'zh-CN',
    base: '/',
    url: 'http://localhost:3030/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide' },
    ],
    sidebar: {
      '/': [
        {
          text: '文档',
          items: [
            { text: '首页', link: '/' },
            { text: '指南', link: '/guide' },
          ],
        },
      ],
    },
  },
});
