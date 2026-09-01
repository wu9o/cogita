import { defineConfig } from '@cogita/core';

const demoPrefix = (process.env.COGITA_DEMO_PREFIX || '').replace(/\/$/, '');
const demoBase = `${demoPrefix}/demos/docs/`;

export default defineConfig({
  site: {
    title: 'Northstar Handbook',
    description: 'A practical engineering handbook for product teams.',
    base: demoBase,
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Principles', link: '/principles' },
      { text: 'Delivery', link: '/delivery' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Northstar Handbook',
          items: [
            { text: 'Engineering principles', link: '/principles' },
            { text: 'Delivery workflow', link: '/delivery' },
          ],
        },
      ],
    },
  },
  builderConfig: {
    output: { assetPrefix: demoBase },
  },
});
