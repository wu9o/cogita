---
title: 文章 Frontmatter 插件设计
---

# 文章 Frontmatter 插件设计

`@cogita/plugin-posts-frontmatter` 是博客内容的基础插件。它扫描文章目录、解析 Markdown frontmatter、计算文章路由，并通过 `virtual-posts-data` 向主题和其他插件提供文章数据。

## 数据流

```text
文件系统 → frontmatter 解析 → 文章索引 → 路由生成 → virtual-posts-data
```

文章列表、标签、RSS、搜索和 SEO 等消费者通过共享 `ContentIndex` 读取这些数据，不应再次扫描同一目录。

## 文章数据

```ts
export interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  url: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  [key: string]: unknown;
}
```

插件支持 `.md` 和 `.mdx`，递归处理嵌套目录，并为缺少标题或日期的文章提供合理降级值。绝对 `filePath` 属于构建期数据；主题运行时应只消费安全的公开字段。

## 路由规则

给定 `posts` 目录和 `posts` 路由前缀：

```text
posts/hello-world.md          → /posts/hello-world
posts/2026/notes/index.md     → /posts/2026/notes
posts/guides/setup.mdx        → /posts/guides/setup
```

路由计算应由统一工具函数完成，避免 RSS、搜索和图片插件各自产生不同 URL。

## 使用

主题可以声明该插件，站点作者通常只需要配置主题：

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-lucid',
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
  },
});
```

自定义消费者应从 `virtual-posts-data` 读取数据：

```ts
import { allPosts } from 'virtual-posts-data';

const recentPosts = allPosts.slice(0, 5);
```

## 生命周期与边界

插件在 `beforeBuild` 阶段准备索引，在 `addPages` 阶段生成文章页面，在 `addRuntimeModules` 阶段发布文章数据。Core 在开发服务器重建前使索引失效，保证新增和修改的文章进入下一轮构建。

插件负责文章发现和元数据，不负责标签筛选、分页、归档、RSS 或主题布局。没有文章时也应提供空的运行时数据，保持零配置体验。

## 兼容性

文章虚拟模块暴露 `contentDataVersion`。主题或插件消费数据前应检查版本，在不兼容时给出诊断或降级。文章能力和共享索引的版本策略见[内容索引设计](../api/content-index-design.html)与[插件 API 规范](./plugin-api-specification.html)。
