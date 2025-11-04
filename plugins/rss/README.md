# @cogita/plugin-rss

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-rss.svg)](https://badge.fury.io/js/@cogita%2Fplugin-rss)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

**中文** | [English](./README.en.md)

> 为Cogita博客生成RSS、Atom和JSON Feed订阅源的插件，自动添加HTML发现链接。

## 这是什么？

此插件自动从您的博客文章生成RSS 2.0、Atom和JSON Feed文件，并在HTML页面中添加发现链接。非常适合希望订阅您博客更新的读者。

## 功能特性

✅ **多种订阅格式**
- RSS 2.0（支持最广泛）
- Atom Feed（现代标准）
- JSON Feed（开发者友好）

✅ **SEO优化**
- 自动注入HTML `<link>` 标签
- 正确的MIME类型和响应头
- 搜索引擎友好的URL

✅ **高度可配置**
- 自定义订阅源路径和限制
- Frontmatter字段映射
- 内容包含选项

✅ **零配置启动**
- 开箱即用的合理默认设置
- 通过frontmatter插件自动检测文章

## 安装

```bash
pnpm add @cogita/plugin-rss
```

> **注意：** 此插件依赖 `@cogita/plugin-posts-frontmatter` 来获取文章数据。

## 快速开始

### 自动使用（推荐）

支持RSS的主题会自动包含此插件：

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '分享我的想法',
    url: 'https://myblog.com'
  },
  theme: 'lucid' // 主题会自动加载RSS插件
});
```

### 手动配置

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';
import { pluginRSS } from '@cogita/plugin-rss';

export default defineConfig({
  plugins: [
    pluginRSS({
      title: '我的博客RSS',
      description: '博客最新文章',
      link: 'https://myblog.com',
      formats: ['rss', 'atom', 'json']
    })
  ]
});
```

## 配置选项

```typescript
interface RSSConfig {
  // 必需配置
  title: string;           // 订阅源标题
  description: string;     // 订阅源描述
  link: string;           // 网站URL
  
  // 可选配置
  language?: string;       // 默认: 'zh-CN'
  copyright?: string;      // 版权声明
  managingEditor?: string; // 编辑者邮箱
  webMaster?: string;      // 网站管理员邮箱
  
  // 输出选项
  formats?: ('rss' | 'atom' | 'json')[]; // 默认: ['rss']
  feedPath?: string;       // 默认: 'rss.xml'
  atomPath?: string;       // 默认: 'atom.xml' 
  jsonPath?: string;       // 默认: 'feed.json'
  
  // 内容选项
  maxItems?: number;       // 默认: 20
  includeContent?: boolean; // 默认: false
  
  // 字段映射
  customFields?: {
    author?: string;       // Frontmatter字段名
    category?: string;     // Frontmatter字段名
  };
}
```

## 使用示例

### 基础RSS订阅

```typescript
pluginRSS({
  title: '技术博客',
  description: '最新技术文章',
  link: 'https://techblog.com'
})
```

### 多格式自定义路径

```typescript
pluginRSS({
  title: '我的博客',
  description: '个人博客更新',
  link: 'https://myblog.com',
  formats: ['rss', 'atom', 'json'],
  feedPath: 'feeds/rss.xml',
  atomPath: 'feeds/atom.xml', 
  jsonPath: 'feeds/feed.json',
  maxItems: 50
})
```

### 自定义字段映射

```typescript
pluginRSS({
  title: '开发者博客',
  description: '软件开发见解',
  link: 'https://devblog.com',
  customFields: {
    author: 'writer',      // 使用frontmatter中的'writer'字段
    category: 'topics'     // 使用'topics'字段作为分类
  }
})
```

## 生成的文件

插件会生成以下文件：

- **`/rss.xml`** - RSS 2.0订阅源（如果启用）
- **`/atom.xml`** - Atom订阅源（如果启用）
- **`/feed.json`** - JSON订阅源（如果启用）

## HTML集成

插件会自动在HTML中添加发现链接：

```html
<head>
  <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
  <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
  <link rel="alternate" type="application/json" title="JSON Feed" href="/feed.json" />
</head>
```

## Frontmatter支持

插件支持标准的frontmatter字段：

```yaml
---
title: "我的第一篇文章"
description: "博客介绍"
date: "2024-01-15"
author: "张三"
categories: ["技术", "博客"]
tags: ["介绍", "欢迎"]
---
```

## 虚拟模块

在组件中访问订阅源元数据：

```typescript
// 在主题组件中可用
import { feedMeta } from 'virtual-rss-meta';

function FeedLinks() {
  return (
    <div>
      {feedMeta.rssUrl && <a href={feedMeta.rssUrl}>RSS</a>}
      {feedMeta.atomUrl && <a href={feedMeta.atomUrl}>Atom</a>}
      {feedMeta.jsonUrl && <a href={feedMeta.jsonUrl}>JSON</a>}
    </div>
  );
}
```

## TypeScript支持

完整的TypeScript支持和导出类型：

```typescript
import type { RSSConfig, FeedMeta } from '@cogita/plugin-rss';
```

## 故障排除

### 订阅源中没有文章

1. 确保先加载了 `@cogita/plugin-posts-frontmatter`
2. 检查posts目录中是否存在文章
3. 验证frontmatter格式是否正确

### 订阅源URL无法访问

1. 检查 `link` 配置是否正确
2. 确保构建成功完成
3. 验证输出目录中是否存在订阅文件

## 示例

查看[插件设计文档](../../docs/plugins/plugin-rss-design.md)了解详细架构和更多示例。

## 许可证

MIT许可证。详情请查看[LICENSE](./LICENSE)。

## 贡献

欢迎贡献！请阅读我们的[贡献指南](../../CONTRIBUTING.md)。
