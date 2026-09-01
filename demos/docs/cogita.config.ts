import { defineConfig } from '@cogita/core';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/docs/`;

export default defineConfig({
  site: {
    title: 'Northstar Handbook',
    description: '一个面向产品团队的工程手册。',
    base: demoBase,
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '原则', link: '/principles' },
      { text: '交付流程', link: '/delivery' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Northstar Handbook',
          items: [
            { text: '工程原则', link: '/principles' },
            { text: '交付流程', link: '/delivery' },
          ],
        },
      ],
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
