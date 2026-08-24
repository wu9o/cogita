import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Cogita',
    description:
      'Cogita 是一个主题驱动的静态博客，记录编码实践、开源构建、调试过程、产品探索与长期思考。',
    icon: '/favicon.svg',
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
  },

  // 示例博客使用 Editorial 主题展示新主题包的默认效果
  theme: '@cogita/theme-editorial',

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

  // 内容质量诊断默认只报告，不阻断示例博客构建
  contentCheck: {
    enabled: true,
    reportPath: 'content-report.json',
    failOnError: false,
    requiredFields: ['title', 'date'],
    checkImages: true,
    checkImageAlt: true,
    checkRoutes: true,
    checkEmptyContent: true,
    checkLinks: true,
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
    description:
      'Cogita 是一个主题驱动的静态博客，记录编码实践、开源构建、调试过程、产品探索与长期思考。',
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
    showTocProgress: true,
    rememberPosition: true,
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
    nav: [
      { text: '首页', link: '/' },
      { text: '全部文章', link: '/archive' },
      { text: '搜索', link: '/search' },
      { text: '标签', link: '/tags' },
      { text: '分类', link: '/categories' },
      { text: '合集', link: '/collections' },
    ],
    editorial: {
      heroEyebrow: 'Cogita · Journal',
      heroCopy: '一个内容优先的技术博客，记录构建、调试和持续思考的过程。',
      relatedPosts: {
        enabled: true,
        limit: 3,
      },
    },
    // 页脚配置 - 全局显示 RSS 订阅链接
    footer: {
      message: `
        <div class="editorial-footer-feeds">
          <span class="editorial-footer-label">订阅本博客</span>
          <a href="/cogita/rss.xml" target="_blank" rel="noopener noreferrer">RSS</a>
          <span aria-hidden="true">•</span>
          <a href="/cogita/atom.xml" target="_blank" rel="noopener noreferrer">Atom</a>
          <span aria-hidden="true">•</span>
          <a href="/cogita/feed.json" target="_blank" rel="noopener noreferrer">JSON Feed</a>
        </div>
      `,
      copyright: 'Copyright © 2025 Cogita - 用心构建，优雅表达',
    },

    // 社交链接 - 导航栏仅保留最重要的项目入口
    socialLinks: [
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
