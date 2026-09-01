import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '__SITE_TITLE__',
    description: 'Project documentation for __SITE_TITLE__.',
    lang: 'en-US',
    base: '/',
    url: 'http://localhost:3030/',
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
      { text: 'Guide', link: '/guide' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide' },
          ],
        },
      ],
    },
  },
});
