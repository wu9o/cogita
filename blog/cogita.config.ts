import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita',
    description: '在这里，我记录编码、创造与思考的瞬间。',
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
  },

  // 使用新的结构化配置
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
    extensions: ['md', 'mdx'],
  },

  rss: {
    title: 'Cogita Blog RSS',
    description: '记录编码、创造与思考的瞬间',
    language: 'zh-CN',
    formats: ['rss', 'atom', 'json'],
    maxItems: 50,
  },

  themeConfig: {
    // 页脚配置 - 全局显示 RSS 订阅链接
    footer: {
      message: `
        <div style="display: flex; gap: 0.75rem; justify-content: center; align-items: center; flex-wrap: wrap; margin: 1rem 0;">
          <span style="color: #666;">📡 订阅本博客：</span>
          <a href="/cogita/rss.xml" target="_blank" rel="noopener noreferrer" style="color: #0969da; text-decoration: none; font-weight: 500;">RSS</a>
          <span style="color: #d0d0d0;">•</span>
          <a href="/cogita/atom.xml" target="_blank" rel="noopener noreferrer" style="color: #0969da; text-decoration: none; font-weight: 500;">Atom</a>
          <span style="color: #d0d0d0;">•</span>
          <a href="/cogita/feed.json" target="_blank" rel="noopener noreferrer" style="color: #0969da; text-decoration: none; font-weight: 500;">JSON Feed</a>
        </div>
      `,
      copyright: 'Copyright © 2025 Cogita - 用心构建，优雅表达',
    },

    // 社交链接 - 导航栏显示
    socialLinks: [
      // RSS 订阅 - 使用自定义 SVG 图标
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368C10.58 4.813 19.199 13.436 19.2 24h4.8C24 10.8 13.2 0 0 0v4.812z"/></svg>',
        },
        mode: 'link',
        content: 'https://wu9o.github.io/cogita/rss.xml',
      },
      // Twitter/X
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/wu9ors',
      },
      // GitHub
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/wu9o',
      },
    ],
  },

  builderConfig: {
    output: {
      assetPrefix: '/cogita/',
    },
  },
});
