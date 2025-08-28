# Cogita 最佳实践指南

本指南提供了使用 Cogita 框架的最佳实践，包括项目组织、性能优化、内容管理和部署策略。

## 📋 目录

- [项目结构组织](#-项目结构组织)
- [配置最佳实践](#-配置最佳实践)
- [内容创作指南](#-内容创作指南)
- [主题使用技巧](#-主题使用技巧)
- [插件开发规范](#-插件开发规范)
- [性能优化策略](#-性能优化策略)
- [部署优化](#-部署优化)
- [SEO 最佳实践](#-seo-最佳实践)
- [故障排除](#-故障排除)

## 📁 项目结构组织

### 推荐的项目结构

```
my-blog/
├── cogita.config.ts          # 主配置文件
├── package.json
├── posts/                    # 文章目录
│   ├── 2024/                 # 按年份组织（推荐）
│   │   ├── introducing-cogita.md
│   │   └── best-practices.md
│   ├── drafts/               # 草稿目录
│   │   └── wip-article.md
│   └── assets/               # 文章资源
│       ├── images/
│       └── documents/
├── pages/                    # 独立页面（可选）
│   ├── about.md
│   └── contact.md
├── public/                   # 静态资源
│   ├── favicon.ico
│   └── images/
├── components/               # 自定义组件（可选）
│   └── CustomPostItem.tsx
└── styles/                   # 自定义样式（可选）
    └── custom.css
```

### 文章组织策略

#### 1. 按时间组织（推荐）

```
posts/
├── 2024/
│   ├── 01-january/
│   ├── 02-february/
│   └── 03-march/
└── 2023/
    ├── 12-december/
    └── 11-november/
```

**优势：**
- 便于管理大量文章
- 时间线清晰
- 支持归档功能

#### 2. 按分类组织

```
posts/
├── tech/
│   ├── web-development/
│   └── data-science/
├── life/
│   └── travel/
└── reviews/
    └── books/
```

**优势：**
- 内容主题明确
- 便于读者浏览
- 支持分类导航

#### 3. 混合组织

```
posts/
├── tech/
│   ├── 2024/
│   └── 2023/
└── life/
    ├── 2024/
    └── 2023/
```

**优势：**
- 兼顾分类和时间
- 适合多主题博客
- 扩展性好

## ⚙️ 配置最佳实践

### 基础配置模板

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '记录技术与生活的点点滴滴',
    base: process.env.NODE_ENV === 'production' ? '/blog/' : '/',
  },
  
  theme: 'lucid',
  
  // 透传给 Rspress 的主题配置
  themeConfig: {
    // 社交链接
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/your-username',
      },
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/your-username',
      },
    ],
    
    // 导航配置
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' },
      { text: '联系', link: '/contact' },
    ],
    
    // 页脚配置
    footer: {
      message: '© 2024 我的博客. 保留所有权利.',
    },
    
    // 搜索配置（如果支持）
    search: {
      mode: 'local',
    },
  },
  
  // 构建配置
  builderConfig: {
    output: {
      // 生产环境资源前缀
      assetPrefix: process.env.NODE_ENV === 'production' 
        ? 'https://cdn.example.com/' 
        : '/',
    },
    
    // HTML 配置
    html: {
      tags: [
        // 添加自定义 meta 标签
        { tag: 'meta', attrs: { name: 'author', content: '你的名字' } },
        { tag: 'meta', attrs: { name: 'keywords', content: '博客,技术,生活' } },
      ],
    },
  },
});
```

### 环境相关配置

```typescript
// 不同环境的配置策略
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: {
    base: isProd ? '/blog/' : '/',
  },
  
  builderConfig: {
    // 开发环境禁用压缩，加快构建速度
    minify: isProd,
    
    // 生产环境启用源码映射
    sourceMap: isProd,
    
    output: {
      // 生产环境使用 CDN
      assetPrefix: isProd ? 'https://cdn.example.com/' : '/',
    },
  },
});
```

### 多语言配置

```typescript
export default defineConfig({
  site: {
    title: 'My Blog',
    description: 'A bilingual blog',
  },
  
  // 多语言支持（计划中的功能）
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': {
        title: '我的博客',
        description: '双语博客',
      },
      'en-US': {
        title: 'My Blog',
        description: 'A bilingual blog',
      },
    },
  },
});
```

## ✍️ 内容创作指南

### Frontmatter 最佳实践

#### 完整的 Frontmatter 模板

```yaml
---
title: "文章标题：简洁且描述性"
description: "文章摘要，用于 SEO 和社交分享，建议 150-160 字符"
createDate: "2024-01-15"
updateDate: "2024-01-20"
tags: 
  - "技术"
  - "Web开发"
  - "React"
categories:
  - "前端开发"
author: "作者名称"
draft: false                    # 是否为草稿
featured: true                  # 是否推荐文章
image: "./assets/cover.jpg"     # 封面图片
excerpt: "自定义摘要，如果不提供则自动提取正文开头"
readingTime: 5                  # 预估阅读时间（分钟）
---
```

#### Frontmatter 字段说明

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题 |
| `description` | string | 推荐 | SEO 描述，社交分享摘要 |
| `createDate` | string | 推荐 | 创建日期 (YYYY-MM-DD) |
| `updateDate` | string | 可选 | 最后更新日期 |
| `tags` | string[] | 推荐 | 文章标签 |
| `categories` | string[] | 可选 | 文章分类 |
| `author` | string | 可选 | 作者名称 |
| `draft` | boolean | 可选 | 是否为草稿（默认 false） |
| `featured` | boolean | 可选 | 是否为推荐文章 |
| `image` | string | 可选 | 封面图片路径 |

### 内容编写规范

#### 1. 标题层级

```markdown
# 一级标题（文章标题，由 frontmatter 生成）

## 二级标题（章节标题）

### 三级标题（小节标题）

#### 四级标题（尽量避免更深层级）
```

#### 2. 代码块最佳实践

```markdown
<!-- 指定语言以启用语法高亮 -->
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

<!-- 为代码块添加标题 -->
```javascript title="utils/helpers.js"
export function formatDate(date) {
  return date.toLocaleDateString();
}
```

<!-- 行号和高亮 -->
```python {1,3-5}
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)
```
```

#### 3. 图片和资源

```markdown
<!-- 相对路径引用（推荐） -->
![图片描述](./assets/images/screenshot.png)

<!-- 指定图片尺寸 -->
![图片描述](./assets/images/diagram.png){ width=600 height=400 }

<!-- 图片说明 -->
![系统架构图](./assets/architecture.png)
*图 1: 系统整体架构图*
```

#### 4. 链接规范

```markdown
<!-- 内部链接 -->
[相关文章](./related-article.md)
[关于页面](/about)

<!-- 外部链接（自动添加 target="_blank"） -->
[GitHub](https://github.com/username/repo)
[官方文档](https://example.com/docs)

<!-- 引用式链接 -->
这是一个[引用链接][ref-link]。

[ref-link]: https://example.com
```

### 草稿管理

#### 草稿配置

```yaml
---
title: "工作中的文章"
draft: true                    # 标记为草稿
---
```

#### 草稿预览

```bash
# 在开发环境预览草稿
NODE_ENV=development npm run dev

# 构建时排除草稿
NODE_ENV=production npm run build
```

### 内容组织技巧

#### 1. 使用摘要

```markdown
---
title: "长文章标题"
---

## 概述

这里是文章的简要概述，会被自动提取作为摘要。

<!-- more -->

这里是文章的详细内容...
```

#### 2. 相关文章链接

```markdown
## 相关文章

- [前一篇：基础概念](./basics.md)
- [下一篇：高级技巧](./advanced.md)
- [相关：最佳实践](./best-practices.md)
```

## 🎨 主题使用技巧

### 自定义样式

#### 1. 全局样式覆盖

```css
/* styles/custom.css */

/* 覆盖主题变量 */
:root {
  --primary-color: #007acc;
  --text-color: #333;
  --background-color: #fff;
  --border-color: #e1e4e8;
}

/* 自定义组件样式 */
.post-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.post-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

#### 2. 在配置中引入样式

```typescript
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/styles/custom.css',
          },
        },
      ],
    },
  },
});
```

### 组件自定义

#### 1. 自定义文章列表项

```tsx
// components/CustomPostItem.tsx
import type { Post } from '@cogita/ui';
import { Link } from '@rspress/theme-default';

export const CustomPostItem: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <article className="custom-post-item">
      <Link href={post.route}>
        <div className="post-header">
          <h2 className="post-title">{post.title}</h2>
          <time className="post-date">
            {new Date(post.createDate).toLocaleDateString()}
          </time>
        </div>
        {post.description && (
          <p className="post-description">{post.description}</p>
        )}
        <div className="post-meta">
          {post.tags && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};
```

#### 2. 在主题中使用自定义组件

```typescript
// cogita.config.ts
import { CustomPostItem } from './components/CustomPostItem';

export default defineConfig({
  themeConfig: {
    components: {
      PostItem: CustomPostItem,
    },
  },
});
```

## 🔌 插件开发规范

### 插件命名规范

- **包名格式**：`@cogita/plugin-{功能名}`
- **导出函数名**：`plugin{功能名}` (驼峰命名)
- **插件名称**：`@cogita/plugin-{功能名}`

### 插件结构最佳实践

```typescript
// src/index.ts
export { pluginYourFeature } from './plugin';
export type { YourFeatureOptions, YourFeatureData } from './types';

// src/plugin.ts
import type { CogitaPluginFactory } from '@cogita/shared';
import { yourFeatureCore } from './core';

export const pluginYourFeature: CogitaPluginFactory = (config) => {
  const options = {
    enabled: true,
    ...config.yourFeature,
  };

  if (!options.enabled) {
    return null;
  }

  return yourFeatureCore(options);
};

// src/core.ts - 核心逻辑分离
export function yourFeatureCore(options: YourFeatureOptions): RspressPlugin {
  return {
    name: '@cogita/plugin-your-feature',
    // 实现细节...
  };
}
```

### 错误处理模式

```typescript
export const pluginExample: CogitaPluginFactory = (config) => {
  try {
    // 配置验证
    const schema = Joi.object({
      enabled: Joi.boolean().default(true),
      apiKey: Joi.string().when('enabled', { is: true, then: Joi.required() }),
    });

    const { error, value: options } = schema.validate(config.example);
    
    if (error) {
      throw new Error(`Plugin configuration error: ${error.message}`);
    }

    return createExamplePlugin(options);
  } catch (error) {
    // 提供有用的错误信息
    console.error('❌ Plugin Example Error:', error.message);
    console.error('💡 提示：请检查 cogita.config.ts 中的 example 配置');
    
    // 决定是抛出错误还是禁用插件
    if (process.env.NODE_ENV === 'development') {
      return null; // 开发环境静默禁用
    } else {
      throw error; // 生产环境抛出错误
    }
  }
};
```

## ⚡ 性能优化策略

### 构建性能优化

#### 1. 缓存策略

```typescript
// 使用构建缓存
export default defineConfig({
  builderConfig: {
    cache: {
      type: 'filesystem',
      cacheDirectory: 'node_modules/.cache/cogita',
    },
  },
});
```

#### 2. 并行构建

```json
{
  "scripts": {
    "build": "pnpm run build:packages --parallel && pnpm run build:blog",
    "build:packages": "pnpm --filter \"@cogita/*\" build",
    "build:blog": "cogita build"
  }
}
```

#### 3. 增量构建

```typescript
// 监听文件变化，只重建必要部分
export const pluginIncrementalBuild: CogitaPluginFactory = (config) => {
  const fileCache = new Map();
  
  return {
    name: 'incremental-build',
    async beforeBuild() {
      // 只处理变更的文件
      const changedFiles = await getChangedFiles();
      // 更新缓存和重新处理
    },
  };
};
```

### 运行时性能优化

#### 1. 代码分割

```typescript
// 懒加载组件
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

const MyComponent: React.FC = () => {
  return (
    <React.Suspense fallback={<div>加载中...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};
```

#### 2. 图片优化

```typescript
export default defineConfig({
  builderConfig: {
    plugins: [
      // 图片压缩插件
      imageOptimizationPlugin({
        webp: true,
        avif: true,
        quality: 80,
      }),
    ],
  },
});
```

#### 3. 资源预加载

```typescript
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        // 预加载关键资源
        {
          tag: 'link',
          attrs: { rel: 'preload', href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        },
      ],
    },
  },
});
```

## 🚀 部署优化

### 静态资源优化

```typescript
export default defineConfig({
  builderConfig: {
    output: {
      // CDN 配置
      assetPrefix: 'https://cdn.example.com/',
      
      // 文件名哈希
      filename: {
        js: '[name].[contenthash].js',
        css: '[name].[contenthash].css',
      },
    },
    
    // 压缩配置
    minify: {
      js: true,
      css: true,
      html: true,
    },
  },
});
```

### GitHub Pages 部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: latest
        
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
      
    - name: Build packages
      run: pnpm run build:packages
      
    - name: Build blog
      run: pnpm --filter blog build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./blog/doc_build
```

### Vercel 部署优化

```json
// vercel.json
{
  "framework": null,
  "buildCommand": "pnpm run build:packages && pnpm --filter blog build",
  "outputDirectory": "blog/doc_build",
  "installCommand": "pnpm install --frozen-lockfile",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🔍 SEO 最佳实践

### Meta 标签优化

```typescript
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        // 基础 SEO 标签
        { tag: 'meta', attrs: { name: 'author', content: '你的名字' } },
        { tag: 'meta', attrs: { name: 'robots', content: 'index, follow' } },
        
        // Open Graph 标签
        { tag: 'meta', attrs: { property: 'og:type', content: 'blog' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: '我的博客' } },
        
        // Twitter Card 标签
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:creator', content: '@your_twitter' } },
        
        // 结构化数据
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "我的博客",
            "description": "技术与生活的记录",
            "url": "https://yourblog.com"
          }),
        },
      ],
    },
  },
});
```

### 内容 SEO 优化

#### 1. 标题优化

```yaml
---
title: "React 18 新特性详解：并发渲染的实现原理"  # 60字符以内
description: "深入解析 React 18 的并发渲染机制，包括 Suspense、Transitions 和自动批处理等新特性的原理和应用场景。"  # 160字符以内
---
```

#### 2. 内容结构优化

```markdown
# 文章标题

## 概述

简要介绍文章内容和要解决的问题。

## 目录

- [问题分析](#问题分析)
- [解决方案](#解决方案)
- [实践案例](#实践案例)
- [总结](#总结)

## 问题分析

详细分析要解决的问题...

### 子问题1

具体问题的细节...

## 解决方案

提供解决方案...

## 总结

总结要点，提供action items。
```

### URL 结构优化

```typescript
// 自定义路由规则
export const pluginSEORoutes: CogitaPluginFactory = (config) => {
  return {
    name: 'seo-routes',
    addPages() {
      return allPosts.map(post => ({
        routePath: `/posts/${post.slug}`,  // 简洁的 URL
        content: post.content,
        filepath: post.filePath,
      }));
    },
  };
};
```

## 🔧 故障排除

### 常见问题和解决方案

#### 1. 构建失败

**问题**: `Error: Cannot find module '@cogita/theme-lucid'`

**解决方案**:
```bash
# 检查依赖安装
pnpm list @cogita/theme-lucid

# 重新安装依赖
pnpm install

# 清理缓存
pnpm store prune
rm -rf node_modules/.cache
```

#### 2. 主题加载失败

**问题**: `Theme does not export a 'getThemeConfig' function`

**解决方案**:
```typescript
// 检查主题导出
import { getThemeConfig } from '@cogita/theme-lucid';
console.log(typeof getThemeConfig); // 应该是 'function'

// 确保主题版本兼容
// package.json
{
  "dependencies": {
    "@cogita/core": "^0.1.0",
    "@cogita/theme-lucid": "^0.1.0"  // 版本要匹配
  }
}
```

#### 3. 文章不显示

**问题**: 文章列表为空

**检查清单**:
```bash
# 1. 检查文章目录
ls -la posts/

# 2. 检查文章格式
head -10 posts/your-article.md

# 3. 检查 frontmatter 格式
---
title: "必须有标题"
createDate: "2024-01-01"  # 日期格式要正确
---

# 4. 检查插件配置
# 确保 posts-frontmatter 插件被正确加载
```

#### 4. 样式不生效

**问题**: 自定义样式没有被应用

**解决方案**:
```typescript
// 1. 确保样式文件被正确引入
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'link',
          attrs: { rel: 'stylesheet', href: '/styles/custom.css' },
        },
      ],
    },
  },
});

// 2. 检查 CSS 选择器优先级
/* 使用更具体的选择器 */
.theme-container .custom-style {
  /* 样式规则 */
}

// 3. 使用 !important（最后选择）
.custom-style {
  color: red !important;
}
```

### 调试技巧

#### 1. 启用详细日志

```bash
# 环境变量启用调试
DEBUG=cogita:* npm run dev

# 或者在配置中启用
export default defineConfig({
  debug: true,
});
```

#### 2. 检查生成的配置

```typescript
// 临时添加配置调试代码
export default defineConfig({
  // ... 你的配置
});

// 在开发环境打印配置
if (process.env.NODE_ENV === 'development') {
  console.log('Final config:', JSON.stringify(config, null, 2));
}
```

#### 3. 使用浏览器开发工具

```javascript
// 在浏览器控制台检查虚拟模块
import('virtual-posts-data').then(module => {
  console.log('Posts data:', module.allPosts);
});
```

### 性能调试

```bash
# 分析构建性能
npm run build -- --analyze

# 检查包大小
npm run build -- --bundle-analyzer

# 检查构建时间
time npm run build
```

## 📚 学习资源

### 官方资源

- [Cogita 文档](../README.md)
- [Rspress 官方文档](https://rspress.dev/)
- [React 官方文档](https://react.dev/)

### 社区资源

- [GitHub Discussions](https://github.com/wu9o/cogita/discussions)
- [示例项目](https://github.com/wu9o/cogita/tree/main/examples)
- [插件模板](https://github.com/wu9o/cogita/tree/main/templates)

### 相关工具

- [Biome](https://biomejs.dev/) - 代码格式化和检查
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [pnpm](https://pnpm.io/) - 包管理器

---

本最佳实践指南将持续更新，欢迎提交你的经验和建议！
