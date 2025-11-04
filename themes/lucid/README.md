# @cogita/theme-lucid

[![npm version](https://badge.fury.io/js/@cogita%2Ftheme-lucid.svg)](https://badge.fury.io/js/@cogita%2Ftheme-lucid)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)

**中文** | [English](./README.en.md)

> Cogita 的默认主题 - 清晰、专注内容的博客主题

## 这是什么？

Lucid 是 Cogita 的官方默认主题，以"清晰"为核心设计原则。它专注于内容可读性和用户体验，采用现代、简洁的设计，让设计退居幕后，让您的内容闪闪发光。

## 特性

- 🎯 **内容优先**：为阅读优化的清洁排版和间距
- 🌙 **智能主题**：自动明暗模式切换，过渡平滑
- 📱 **移动就绪**：在所有设备上都能正常工作的响应式设计
- ⚡ **高性能**：优化的 CSS 和 JavaScript，快速加载
- ♿ **无障碍**：符合 WCAG 标准，支持键盘导航

## 快速开始

### 安装

```bash
pnpm add @cogita/core @cogita/theme-lucid
```

### 基础设置

创建 `cogita.config.ts`：

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的 Lucid 博客',
    description: '由 Cogita Lucid 主题驱动的博客',
  },
  theme: 'lucid',
});
```

在 `posts/welcome.md` 中创建第一篇文章：

```markdown
---
title: "欢迎使用 Lucid"
description: "探索 Lucid 主题的优雅设计"
createDate: "2024-01-01"
tags: ["cogita", "lucid", "博客"]
---

# 欢迎使用 Lucid

Lucid 主题为您的博客提供清洁、现代的设计...
```

启动开发：

```bash
pnpm dev
```

## 配置

### 基础主题配置

```typescript
export default defineConfig({
  site: {
    title: '我的博客',
    description: '个人博客',
  },
  theme: 'lucid',
  
  themeConfig: {
    // 导航
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' },
      { text: '联系', link: '/contact' },
    ],
    
    // 社交链接
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/you' },
      { icon: 'x', mode: 'link', content: 'https://x.com/you' },
      { icon: 'rss', mode: 'link', content: '/rss.xml' },
    ],
    
    // 页脚
    footer: {
      message: '© 2024 我的博客. 用 ❤️ 和 Cogita 构建',
    },
    
    // 主题模式
    colorMode: 'auto', // 'light' | 'dark' | 'auto'
  },
});
```

### 高级导航

```typescript
themeConfig: {
  nav: [
    { text: '首页', link: '/' },
    {
      text: '文章',
      items: [
        { text: '技术文章', link: '/posts/tech' },
        { text: '生活故事', link: '/posts/life' },
      ],
    },
    { text: '关于', link: '/about' },
  ],
}
```

## 主题功能

### 自动博客功能

- **文章列表**：首页自动显示最新文章
- **文章页面**：优化阅读体验的单独文章页面
- **分页**：大量文章时自动分页
- **阅读时间**：估算阅读时间计算

### 内置插件

Lucid 自动包含：

- `@cogita/plugin-posts-frontmatter` - 提取文章元数据
- 更多插件即将推出...

### SEO 优化

- 自动生成 meta 标签
- 社交分享的 Open Graph 标签
- 结构化数据标记
- 优化的加载性能

## 自定义

### CSS 变量

覆盖主题颜色和间距：

```css
/* styles/custom.css */
:root {
  /* 品牌颜色 */
  --lucid-primary: #007acc;
  --lucid-primary-hover: #005a99;
  
  /* 字体 */
  --lucid-font-family: 'Inter', system-ui, sans-serif;
  --lucid-font-size-base: 16px;
  
  /* 间距 */
  --lucid-space-unit: 8px;
  
  /* 布局 */
  --lucid-content-width: 800px;
  --lucid-radius: 6px;
}

/* 暗色模式覆盖 */
[data-theme='dark'] {
  --lucid-primary: #58a6ff;
  --lucid-bg-primary: #0d1117;
  --lucid-text-primary: #f0f6fc;
}
```

在配置中导入：

```typescript
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'link',
          attrs: { rel: 'stylesheet', href: '/styles/custom.css' }
        }
      ]
    }
  }
});
```

### 自定义组件

通过创建自定义布局覆盖主题组件：

```tsx
// components/CustomPostItem.tsx
import { PostItem } from '@cogita/ui';
import type { Post } from '@cogita/ui';

export const CustomPostItem: React.FC<{ post: Post }> = ({ post }) => (
  <article className="custom-post-item">
    <h2>{post.title}</h2>
    {post.cover && <img src={post.cover} alt={post.title} />}
    <p>{post.description}</p>
    <div className="meta">
      <time>{post.createDate}</time>
      {post.tags && (
        <div className="tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </article>
);
```

## 内容指南

### 文章 Frontmatter

```yaml
---
title: "您的文章标题"
description: "SEO 和社交分享的简要描述"
createDate: "2024-01-01"
updateDate: "2024-01-15"
tags: ["标签1", "标签2"]
categories: ["分类1"]
author: "作者姓名"
cover: "./cover.jpg"
featured: true
---
```

### 支持的内容

- **Markdown**：带扩展的标准 Markdown
- **MDX**：Markdown 中的 React 组件（计划中）
- **图片**：自动优化和懒加载
- **代码**：使用 Prism.js 语法高亮

## 性能

### 优化功能

- **懒加载**：图片和非关键内容
- **代码分割**：自动基于路由的分割
- **CSS 优化**：关键 CSS 内联
- **资源优化**：自动压缩和缓存

### 构建配置

```typescript
export default defineConfig({
  builderConfig: {
    // 性能优化
    output: {
      assetPrefix: 'https://cdn.example.com/',
    },
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});
```

## 响应式设计

### 断点

- **移动端**：< 640px
- **平板**：640px - 768px
- **桌面**：768px - 1024px
- **大屏**：> 1024px

### 移动端优化

- 触摸友好的导航
- 优化的字体大小
- 简化的布局
- 慢连接下的快速加载

## SEO 功能

### 自动 Meta 标签

```html
<meta property="og:title" content="您的文章标题" />
<meta property="og:description" content="文章描述" />
<meta property="og:image" content="文章封面图" />
<meta name="twitter:card" content="summary_large_image" />
```

### 结构化数据

自动生成 JSON-LD：
- 博客文章
- 作者信息
- 组织数据
- 面包屑导航

## 故障排除

### 常见问题

**主题未加载：**
```bash
# 检查主题是否正确安装
npm list @cogita/theme-lucid

# 验证配置
export default defineConfig({
  theme: 'lucid', // 应该是字符串，不是导入
});
```

**样式问题：**
```bash
# 检查 CSS 导入顺序
import '@cogita/ui/styles'; // 应该先导入
import './custom.css';      // 然后是自定义样式
```

**文章不显示：**
```bash
# 检查文章目录结构
posts/
  └── your-post.md  # 应该有正确的 frontmatter
```

## 了解更多

- 📖 [完整文档](../../docs/README.md)
- 🎨 [主题开发指南](../../docs/theme-development.md)
- 💡 [最佳实践](../../docs/best-practices.md)
- 🔧 [API 参考](../../docs/api-reference.md)

## 相关包

- [🧠 @cogita/core](../../packages/core) - 核心博客引擎
- [🚀 @cogita/cli](../../packages/cli) - 命令行工具
- [🎨 @cogita/ui](../../packages/ui) - UI 组件

## 许可证

MIT © [wu9o](https://github.com/wu9o)