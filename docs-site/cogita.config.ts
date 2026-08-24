import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita Documentation',
    description: '主题驱动的静态站点框架使用手册。',
    base: '/docs/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始使用', link: '/getting-started' },
      { text: '使用指南', link: '/guides/' },
      { text: 'API 与架构', link: '/api/' },
      { text: '插件开发', link: '/plugins/' },
    ],
    sidebar: {
      '/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/getting-started' },
            { text: '配置指南', link: '/configuration' },
          ],
        },
        {
          text: '使用指南',
          items: [
            { text: '指南总览', link: '/guides/' },
            { text: '最佳实践', link: '/guides/best-practices' },
            { text: '开发指南', link: '/guides/development' },
            { text: '部署指南', link: '/guides/deployment' },
            { text: '主题使用与扩展', link: '/theme-customization' },
          ],
        },
        {
          text: '架构与 API',
          items: [
            { text: '文档总览', link: '/api/' },
            { text: '架构设计', link: '/api/architecture-design' },
            { text: '内容索引设计', link: '/api/content-index-design' },
            { text: 'API 参考', link: '/api/api-reference' },
            { text: '主题开发指南', link: '/theme-development' },
          ],
        },
        {
          text: '插件开发',
          items: [
            { text: '插件总览', link: '/plugins/' },
            { text: '插件开发指南', link: '/plugins/plugin-development' },
            { text: '插件 API 规范', link: '/plugins/plugin-api-specification' },
            { text: 'Posts Frontmatter', link: '/plugins/plugin-posts-frontmatter-design' },
            { text: 'RSS', link: '/plugins/plugin-rss-design' },
            { text: 'Images', link: '/plugins/plugin-images-design' },
            { text: 'Sitemap', link: '/plugins/plugin-sitemap-design' },
            { text: 'SEO', link: '/plugins/plugin-seo-design' },
            { text: 'Blog List', link: '/plugins/plugin-blog-list-design' },
            { text: 'Search', link: '/plugins/plugin-search-design' },
            { text: 'Categories', link: '/plugins/plugin-categories-design' },
            { text: 'Reading Progress', link: '/plugins/plugin-reading-progress-design' },
            { text: 'Code Copy', link: '/plugins/plugin-code-copy-design' },
            { text: 'Comments', link: '/plugins/plugin-comments-design' },
            { text: 'Content Check', link: '/plugins/plugin-content-check-design' },
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
