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

  images: {
    enabled: true,
    dir: 'public/images',
    readDimensions: true,
    warnOnMissingAlt: true,
  },

  markdown: {
    image: {
      checkDeadImages: true,
    },
  },

  mediumZoom: {
    selector: '.rspress-doc p > img, .rspress-doc figure:not([class*="postCover"]) > img',
  },

  rss: {
    title: 'Cogita Blog RSS',
    description: '记录编码、创造与思考的瞬间',
    language: 'zh-CN',
    formats: ['rss', 'atom', 'json'],
    maxItems: 50,
  },

  sitemap: {
    enabled: true,
    path: 'sitemap.xml',
    includeHome: true,
    includePosts: true,
    changefreq: 'weekly',
    priority: 0.7,
  },

  seo: {
    enabled: true,
    defaultImage: '/images/cogita-architecture.svg',
    defaultImageAlt: 'Cogita 主题驱动架构示意图',
    author: 'wu9o',
    twitterCard: 'summary_large_image',
    twitterSite: '@wu9ors',
    twitterCreator: '@wu9ors',
    includeJsonLd: true,
    audit: {
      enabled: true,
      reportPath: 'seo-report.json',
    },
  },

  // 标签配置
  tags: {
    enabled: true,
    routePrefix: 'tags',
    tagCloud: {
      sortBy: 'count',
      limit: 30,
      minFontSize: 14,
      maxFontSize: 28,
    },
    excludeTags: ['draft'],
    minPostCount: 1,
  },

  // 文章分类与层级分类
  categories: {
    enabled: true,
    routePrefix: 'categories',
    separator: '/',
    metadata: {
      前端: {
        title: '前端开发',
        description: '前端工程实践与技术探索',
      },
      '工程实践/Git': {
        title: 'Git',
        description: '版本控制与协作实践',
      },
    },
    sortBy: 'name',
  },

  // 阅读进度与预计阅读时间
  readingProgress: {
    enabled: true,
    showBar: true,
    showReadingTime: true,
    wordsPerMinute: 300,
    includeCode: false,
  },

  // 为文章代码块提供一键复制
  codeCopy: {
    enabled: true,
    selector: '.rspress-doc pre',
    buttonLabel: '复制代码',
    languageLabel: '复制 {language} 代码',
    copiedLabel: '已复制',
    errorLabel: '复制失败',
    resetDelay: 2000,
  },

  // 使用 GitHub Discussions 保存文章评论
  comments: {
    enabled: true,
    provider: 'giscus',
    title: '评论',
    giscus: {
      repo: 'wu9o/cogita-comments',
      repoId: 'R_kgDOUBWpKg',
      category: 'General',
      categoryId: 'DIC_kwDOUBWpKs4DEALB',
      mapping: 'pathname',
      strict: false,
      reactionsEnabled: true,
      emitMetadata: false,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'zh-CN',
      loading: 'lazy',
    },
  },

  // 合集配置
  collections: {
    enabled: true,
    routePrefix: 'collections',
    metadata: {
      'frontend-advanced': {
        title: '前端进阶系列',
        description: '从 React Hooks 到 TypeScript 类型系统，系统提升前端能力',
      },
    },
    minPostCount: 1,
  },

  // 文章列表与时间归档
  blogList: {
    enabled: true,
    routePrefix: 'archive',
    pageSize: 5,
    sortBy: 'createDate',
    order: 'desc',
    generateArchives: true,
    archivePrefix: 'archives',
    archiveGranularity: 'year',
  },
  search: {
    enabled: true,
    routePrefix: 'search',
    includeContent: true,
    maxContentLength: 12_000,
    maxResults: 20,
    minQueryLength: 1,
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
