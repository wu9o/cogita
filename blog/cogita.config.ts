import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita, Ergo Sum | 我思，故我在',
    description:
      '在这里，我记录编码、创造与思考的瞬间。Cogita 框架，便是我对"优雅构建"的一次哲学实践。',
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
    socialLinks: [
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/wu9ors',
      },
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
