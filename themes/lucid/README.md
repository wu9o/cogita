# @cogita/theme-lucid

Lucid 是 Cogita 的默认主题，提供简洁、现代的博客布局。

## 特性

- 🎨 现代化的 Hero 区域设计
- 📱 完全响应式布局
- 🌙 暗色模式支持
- 🔌 与 RSS、搜索、标签等插件协同工作
- ⚡ 性能优化
- 🎯 SEO 友好

## 配置选项

### 基础配置

主题会自动从 `cogita.config.ts` 中读取站点信息，并从 `themeConfig.lucid` 读取主题专属配置：

```typescript
export default defineConfig({
  site: {
    title: 'Cogita',           // 显示在页脚和站点概览中
    description: '...',         // 显示在首页 Hero 区域
    base: '/cogita/',          // 用于生成站内链接
  },
  
  themeConfig: {
    lucid: {
      heroEyebrow: 'Cogita · Notes',
      heroCopy: '这里记录我在编程路上的思考与实践。',
      postsTitle: '最近更新',
      showSidebar: true,
      featuredPost: '/posts/introducing-cogita',
    },
    footer: {
      message: '用心构建 · Cogita',
      copyright: '© 2026 Cogita',
    },
  }
});
```

### 主题自定义配置

在 `themeConfig.lucid` 中可以添加以下可选配置：

```typescript
themeConfig: {
  lucid: {
    // Hero 上方的小标题
    heroEyebrow: 'My Notes',

    // Hero 区域的补充描述
    heroCopy: '这里记录我在编程路上的思考与实践。',

    // 文章列表区域的标题
    postsTitle: '最近更新',

    // 是否显示首页标签、分类和合集侧栏
    showSidebar: true,

    // 可选：指定主推文章的 route
    featuredPost: '/posts/introducing-cogita',
  },
  // 其他 Rspress themeConfig 选项...
  footer: { ... },
}
```

## 布局结构

### 首页布局

```
┌─────────────────────────────────────┐
│          Rspress 导航栏              │
├─────────────────────────────────────┤
│                                     │
│        Hero Section                 │
│   ┌───────────────────────┐         │
│   │  站点标题 (title)      │         │
│   │  副标题 (description) │         │
│   │  描述 + RSS 链接      │         │
│   └───────────────────────┘         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Posts Section                    │
│   ┌───────────────────────┐         │
│   │  章节标题             │         │
│   │  ┌─────────────────┐ │         │
│   │  │ 文章 1          │ │         │
│   │  ├─────────────────┤ │         │
│   │  │ 文章 2          │ │         │
│   │  ├─────────────────┤ │         │
│   │  │ 文章 3          │ │         │
│   │  └─────────────────┘ │         │
│   └───────────────────────┘         │
│                                     │
├─────────────────────────────────────┤
│          Rspress 页脚               │
└─────────────────────────────────────┘
```

## RSS 订阅入口

RSS 文件由 `@cogita/plugin-rss` 生成，主题不硬编码 feed 地址；站点可以在自己的导航或页脚配置中提供订阅入口。

如果没有配置可选插件，Lucid 仍然可以只依赖文章插件完成构建。主题会为未启用的插件提供空运行时模块，避免布局在编译阶段导入不存在的虚拟模块；启用插件后，真实数据会自动覆盖默认值。

## 样式自定义

### CSS 变量

主题使用 CSS 变量，你可以在自定义样式中覆盖它们：

```css
:root {
  --lucid-canvas: #f5f7fb;
  --lucid-surface: #ffffff;
  --lucid-text: #182235;
  --lucid-text-muted: #667187;
  --lucid-accent: #4569d8;
  /* 也可以继续覆盖 --lucid-border、--lucid-shadow 等变量 */
}
```

### 响应式断点

- 移动端布局：`max-width: 800px`

## 完整配置示例

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Tech Blog',
    description: '这里记录我在编程路上的思考与实践。',
    base: '/blog/',
    url: 'https://example.com/blog/',
  },

  themeConfig: {
    lucid: {
      heroEyebrow: 'My Notes',
      heroCopy: '这里记录我在编程路上的思考与实践。',
      postsTitle: '技术文章',
      showSidebar: true,
    },
    
    // 页脚配置
    footer: {
      message: '📡 <a href="/blog/rss.xml">RSS 订阅</a>',
      copyright: 'Copyright © 2025 My Tech Blog',
    },
    
    // 社交链接
    socialLinks: [
      {
        icon: {
          svg: '<svg>...</svg>' // RSS 图标 SVG
        },
        mode: 'link',
        content: 'https://example.com/blog/rss.xml',
      },
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/username',
      },
    ],
  },
});
```

## 默认值

如果不提供自定义配置，主题将使用以下默认值：

- `heroCopy`: "一份安静、清晰的技术写作空间，记录构建、调试和持续思考。"
- `postsTitle`: "最近更新"
- Hero 主标题：使用 `site.description`
- 站点名称：使用 `site.title`

## 开发

```bash
# 构建主题
pnpm build

# 在文档站示例中测试
pnpm --filter docs-site dev
```

## License

MIT
