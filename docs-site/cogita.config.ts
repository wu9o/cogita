import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita Documentation',
    description: 'The English-first handbook for Cogita, a theme-driven static site framework.',
    lang: 'en-US',
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
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
      { text: 'Get started', link: '/getting-started' },
      { text: 'Themes', link: '/themes' },
      { text: 'Knowledge theme', link: '/themes/theme-knowledge-design' },
      { text: 'Guides', link: '/guides/' },
      { text: 'API & architecture', link: '/api/' },
      { text: 'Plugins', link: '/plugins/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Quick start', link: '/getting-started' },
            { text: 'Configuration', link: '/configuration' },
            { text: 'Theme overview', link: '/themes' },
            { text: 'Knowledge theme', link: '/themes/theme-knowledge-design' },
            { text: 'Package and capability map', link: '/package-map' },
            { text: 'Third-party starter', link: '/starters' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Guide overview', link: '/guides/' },
            { text: 'Best practices', link: '/guides/best-practices' },
            { text: 'Development guide', link: '/guides/development' },
            { text: 'Deployment guide', link: '/guides/deployment' },
            { text: 'Site upgrade and doctor', link: '/guides/site-doctor' },
            { text: 'Content repository migration', link: '/guides/migration' },
            { text: 'Theme usage and extension', link: '/theme-customization' },
          ],
        },
        {
          text: 'Architecture & API',
          items: [
            { text: 'API overview', link: '/api/' },
            { text: 'Architecture design', link: '/api/architecture-design' },
            { text: 'Content index design', link: '/api/content-index-design' },
            { text: 'API reference', link: '/api/api-reference' },
            { text: 'Theme development guide', link: '/theme-development' },
          ],
        },
        {
          text: 'Plugin development',
          items: [
            { text: 'Plugin overview', link: '/plugins/' },
            { text: 'Plugin development guide', link: '/plugins/plugin-development' },
            { text: 'Plugin API specification', link: '/plugins/plugin-api-specification' },
            { text: 'Post metadata', link: '/plugins/plugin-posts-frontmatter-design' },
            { text: 'RSS', link: '/plugins/plugin-rss-design' },
            { text: 'Images', link: '/plugins/plugin-images-design' },
            { text: 'Sitemap', link: '/plugins/plugin-sitemap-design' },
            { text: 'SEO', link: '/plugins/plugin-seo-design' },
            { text: 'Post list', link: '/plugins/plugin-blog-list-design' },
            { text: 'Search', link: '/plugins/plugin-search-design' },
            { text: 'Categories', link: '/plugins/plugin-categories-design' },
            { text: 'Reading progress', link: '/plugins/plugin-reading-progress-design' },
            { text: 'Code copy', link: '/plugins/plugin-code-copy-design' },
            { text: 'Comments', link: '/plugins/plugin-comments-design' },
            { text: 'Content check', link: '/plugins/plugin-content-check-design' },
          ],
        },
      ],
    },
  },
  builderConfig: {
    output: {
      assetPrefix: '/cogita/',
    },
  },
});
