# @cogita/plugin-posts-frontmatter

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter.svg)](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

**中文** | [English](./README.md)

> 自动扫描文章并为 Cogita 主题提取 frontmatter 数据的核心插件

## 这是什么？

此插件自动扫描您的 `posts/` 目录，从 Markdown 文件中提取 frontmatter，并通过虚拟模块向主题提供数据。它是博客文章列表、归档和其他内容驱动功能的基础。

## 安装

```bash
pnpm add @cogita/plugin-posts-frontmatter
```

> **注意：** 在 Cogita 框架中，此插件由需要它的主题（如 `@cogita/theme-lucid`）自动包含。通常不需要手动安装。

## 工作原理

1. **扫描** posts 目录中的所有 `.md` 和 `.mdx` 文件
2. **提取** 每个文件的 frontmatter 元数据
3. **生成** 每篇文章的路由
4. **创建** 包含所有文章数据的虚拟模块
5. **提供** 通过 `virtual-posts-data` 向主题提供数据

## 使用方法

### 自动使用（推荐）

简单使用兼容的 Cogita 主题：

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: 'lucid', // 主题自动加载此插件
});
```

### 手动配置（高级用法）

用于自定义设置或 Rspress 项目：

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    (config) => pluginPostsFrontmatter({
      ...config,
      postsDir: 'posts',
      routePrefix: 'posts',
      cwd: process.cwd(),
    })
  ],
});
```

## 虚拟模块

插件创建 `virtual-posts-data` 模块：

```tsx
// 在主题组件中可用
import { allPosts } from 'virtual-posts-data';

function BlogHome() {
  const recentPosts = allPosts.slice(0, 5);
  
  return (
    <div>
      {recentPosts.map(post => (
        <article key={post.url}>
          <h2>{post.title}</h2>
          <time>{post.createDate}</time>
          <p>{post.description}</p>
        </article>
      ))}
    </div>
  );
}
```

## 文章格式

### Frontmatter 示例

```markdown
---
title: "您的文章标题"
description: "SEO 和分享用的简要描述"
createDate: "2024-01-01"
updateDate: "2024-01-15"
tags: ["标签1", "标签2"]
categories: ["分类1"]
author: "作者姓名"
draft: false
featured: true
---

# 您的文章内容从这里开始

编写您的 Markdown 内容...
```

### 支持的字段

| 字段 | 类型 | 描述 | 默认值 |
|------|------|------|-------|
| `title` | string | 文章标题 | 文件名 |
| `description` | string | 文章描述 | - |
| `createDate` | string | 创建日期 (YYYY-MM-DD) | 文件创建时间 |
| `updateDate` | string | 最后更新日期 | 文件修改时间 |
| `tags` | string[] | 文章标签 | - |
| `categories` | string[] | 文章分类 | - |
| `author` | string | 作者姓名 | - |
| `draft` | boolean | 草稿状态 | false |
| `featured` | boolean | 推荐文章 | false |

### 日期格式

支持多种日期格式：

```yaml
# 推荐
createDate: "2024-01-01"
createDate: "2024-01-01T10:30:00Z"

# 也支持
date: "2024-01-01"          # createDate 的别名
createDate: "Jan 1, 2024"
createDate: "2024/01/01"
```

## 配置

### 插件选项

```typescript
interface PluginConfig {
  postsDir?: string;        // 文章目录（默认：'posts'）
  routePrefix?: string;     // 路由前缀（默认：'posts'）
  cwd?: string;            // 项目根目录
  sortBy?: string;         // 排序字段（默认：'createDate'）
  sortOrder?: string;      // 排序顺序（默认：'desc'）
}
```

### 目录结构

```
posts/
├── hello-world.md        → /posts/hello-world
├── 2024/
│   └── new-year.md      → /posts/2024/new-year
└── tech/
    └── react-tips.md    → /posts/tech/react-tips
```

## 数据结构

### PostFrontmatter 接口

```typescript
interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;         // 绝对文件路径
  route: string;           // 路由路径（如：'/posts/hello-world'）
  url: string;             // 与 route 相同（兼容性）
  createDate: string;      // ISO 日期字符串
  updateDate: string;      // ISO 日期字符串
  tags?: string[];
  categories?: string[];
  [key: string]: any;      // 额外的 frontmatter 字段
}
```

## TypeScript 支持

添加客户端类型定义：

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

或在 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "types": ["@cogita/plugin-posts-frontmatter/client"]
  }
}
```

## 自定义

### 自定义排序顺序

```typescript
// 按更新日期排序
pluginPostsFrontmatter({
  sortBy: 'updateDate',
  sortOrder: 'desc'
});
```

### 过滤文章

```typescript
// 自定义插件包装器
export const myPostsPlugin = (config) => {
  const plugin = pluginPostsFrontmatter(config);
  const originalBeforeBuild = plugin.beforeBuild;
  
  plugin.beforeBuild = async function() {
    await originalBeforeBuild?.call(this);
    // 在生产环境中过滤掉草稿文章
    if (process.env.NODE_ENV === 'production') {
      allPosts = allPosts.filter(post => !post.draft);
    }
  };
  
  return plugin;
};
```

## 故障排除

### 文章不显示

检查这些常见问题：

1. **文件位置**：确保文件在 `posts/` 目录中
2. **文件扩展名**：使用 `.md` 或 `.mdx` 扩展名
3. **Frontmatter 格式**：有效的 YAML frontmatter
4. **草稿状态**：检查是否设置了 `draft: true`

```bash
# 调试：检查 posts 目录
ls -la posts/

# 调试：验证 frontmatter
head -10 posts/your-post.md
```

### 路由问题

- 避免文件名中的特殊字符
- 使用 kebab-case 获得最佳 SEO
- 检查冲突的路由

### 性能

对于大量文章：

```typescript
// 启用缓存
export default defineConfig({
  builderConfig: {
    cache: { type: 'filesystem' }
  }
});
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/wu9o/cogita.git
cd cogita/plugins/posts-frontmatter

# 安装依赖
pnpm install

# 构建插件
pnpm build

# 运行测试
pnpm test
```

## 了解更多

- 📖 [插件开发指南](../../docs/plugin-development.md)
- 🔧 [API 参考](../../docs/api-reference.md)
- 💡 [最佳实践](../../docs/best-practices.md)
- 🏗️ [架构指南](../../docs/architecture-design.md)

## 相关包

- [🧠 @cogita/core](../../packages/core) - 核心博客引擎
- [🎨 @cogita/theme-lucid](../../themes/lucid) - 使用此插件的默认主题
- [🎨 @cogita/ui](../../packages/ui) - 用于显示文章的 UI 组件

## 许可证

MIT © [wu9o](https://github.com/wu9o)