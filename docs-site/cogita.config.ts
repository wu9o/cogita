import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita Documentation',
    description: '主题驱动的静态站点框架使用手册。',
    base: '/docs/',
  },
  theme: '@cogita/theme-docs',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始使用', link: '/getting-started' },
      { text: 'API 参考', link: '/api/architecture-design' },
      { text: '插件开发', link: '/plugins/plugin-api-specification' },
    ],
    sidebar: {
      '/': [
        {
          text: '开始使用',
          items: [{ text: '快速开始', link: '/getting-started' }],
        },
        {
          text: '架构与 API',
          items: [
            { text: '架构设计', link: '/api/architecture-design' },
            { text: '插件 API 规范', link: '/plugins/plugin-api-specification' },
          ],
        },
      ],
    },
  },
  builderConfig: {
    output: {
      assetPrefix: '/docs/',
    },
  },
});
