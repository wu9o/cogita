# @cogita/theme-lucid

Lucid 是 Cogita 的默认主题，提供简洁、现代的博客布局。

## 特性

- 🎨 现代化的 Hero 区域设计
- 📱 完全响应式布局
- 🌙 暗色模式支持
- 📡 内置 RSS 订阅入口
- ⚡ 性能优化
- 🎯 SEO 友好

## 配置选项

### 基础配置

主题会自动从 `cogita.config.ts` 中读取以下配置：

```typescript
export default defineConfig({
  site: {
    title: 'Cogita',           // 显示在 Hero 区域的主标题
    description: '...',         // 显示在 Hero 区域的副标题
    base: '/cogita/',          // 用于生成正确的 RSS 链接
  },
  
  themeConfig: {
    // 可选配置项
  }
});
```

### 主题自定义配置

在 `themeConfig` 中可以添加以下可选配置：

```typescript
themeConfig: {
  // Hero 区域的描述文字（默认：'在这里，我分享关于技术、开发和思考的文章。'）
  heroDescription: '你的自定义描述文字',
  
  // 文章列表区域的标题（默认：'最新文章'）
  postsTitle: '博客文章',
  
  // 其他 Rspress themeConfig 选项...
  footer: { ... },
  socialLinks: [ ... ]
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

主题提供了三种 RSS 订阅入口：

1. **导航栏** - 右上角的 RSS 图标（社交链接）
2. **Hero 描述** - 内嵌在描述文字中的文字链接
3. **页脚** - 全局可见的订阅链接列表

## 样式自定义

### CSS 变量

主题使用 CSS 变量，你可以在自定义样式中覆盖它们：

```css
:root {
  --cogita-primary-color: #1a1a1a;
  --cogita-title-color: #222222;
  --cogita-text-color: #555555;
  --cogita-hero-title-color: #0f172a;
  --cogita-hero-subtitle-color: #475569;
  /* ... 更多变量 */
}
```

### 响应式断点

- 平板设备：`max-width: 768px`
- 手机设备：`max-width: 600px`

## 完整配置示例

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Tech Blog',
    descript限可能',
    base: '/blog/',
    url: 'https://example.com/blog/',
  },

  themeConfig: {
    // 自定义 Hero 描述
    heroDescription: '这里记录我在编程路上的思考与实践。',
    
    // 自定义文章列表标题
    postsTitle: '技术文章',
    
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

- `heroDescription`: "在这里，我分享关于技术、开发和思考的文章。"
- `postsTitle`: "最新文章"
- Hero 标题：使用 `site.title`
- Hero 副标题：使用 `site.description`

## 开发

```bash
# 构建主题
pnpm build

# 在示例博客中测试
pnpm --filter blog dev
```

## License

MIT
