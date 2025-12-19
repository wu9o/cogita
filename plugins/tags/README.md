# @cogita/plugin-tags

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-tags.svg)](https://badge.fury.io/js/@cogita%2Fplugin-tags)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

[中文](../../README.md) | **English**

> 为 Cogita 博客提供完整的标签管理、标签页面生成和标签云功能的插件。

## 功能特性

✅ **智能标签提取**
- 自动从文章 frontmatter 提取标签
- 支持中文和英文标签
- 可配置的标签名称转换和标准化

✅ **标签页面生成**
- 自动生成标签索引页面 (`/tags`)
- 为每个标签生成专门页面 (`/tags/javascript`)
- 支持分页和相关标签推荐

✅ **标签云可视化**
- 基于使用频率的视觉权重
- 可自定义字体大小和透明度
- 响应式设计和交互效果

✅ **灵活配置**
- 零配置开箱即用
- 丰富的自定义选项
- 支持标签过滤和排除

## 安装使用

```bash
pnpm add @cogita/plugin-tags
```

> **注意**：此插件依赖 `@cogita/plugin-posts-frontmatter` 来访问文章数据。

## 快速开始

### 自动使用（推荐）

插件会被支持的主题自动包含：

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '分享技术思考',
    url: 'https://myblog.com'
  },
  
  // 启用标签功能
  tags: {
    enabled: true,
    routePrefix: 'tags',
    tagCloud: {
      sortBy: 'count',
      limit: 30,
    },
  },
  
  theme: 'lucid' // 主题会自动加载 Tags 插件
});
```

### 文章中使用标签

在文章的 frontmatter 中添加标签：

```yaml
---
title: "React Hooks 最佳实践"
date: "2025-01-01"
tags: ["React", "JavaScript", "前端开发", "Hooks"]
description: "深入探讨 React Hooks 的使用场景"
---
```

## 配置选项

```typescript
interface TagsConfig {
  // 基础配置
  enabled?: boolean;        // 是否启用标签功能，默认 true
  routePrefix?: string;     // 路由前缀，默认 'tags'
  
  // 标签云配置
  tagCloud?: {
    minFontSize?: number;   // 最小字体大小，默认 12px
    maxFontSize?: number;   // 最大字体大小，默认 24px
    minOpacity?: number;    // 最小透明度，默认 0.5
    maxOpacity?: number;    // 最大透明度，默认 1.0
    sortBy?: 'name' | 'count' | 'date'; // 排序方式，默认 'count'
    limit?: number;         // 显示数量限制，默认 50
  };
  
  // 页面配置
  postsPerPage?: number;    // 每页文章数量，默认 10
  layout?: string;          // 页面布局，默认 'tag'
  
  // 高级配置
  generateRss?: boolean;    // 是否生成标签RSS，默认 false
  tagTransform?: (tag: string) => string; // 标签名称转换函数
  excludeTags?: string[];   // 排除的标签列表，默认 []
  minPostCount?: number;    // 最小文章数阈值，默认 1
}
```

## 使用示例

### 基础配置

```typescript
export default defineConfig({
  tags: {
    enabled: true,
    routePrefix: 'topics', // 使用 /topics/javascript 而不是 /tags/javascript
  }
});
```

### 完整配置

```typescript
export default defineConfig({
  tags: {
    enabled: true,
    routePrefix: 'tags',
    tagCloud: {
      sortBy: 'count',
      limit: 50,
      minFontSize: 14,
      maxFontSize: 32,
      minOpacity: 0.6,
      maxOpacity: 1.0,
    },
    postsPerPage: 15,
    generateRss: true,
    excludeTags: ['draft', 'private'],
    minPostCount: 2, // 只显示至少有2篇文章的标签
    tagTransform: (tag) => tag.toLowerCase().trim(),
  }
});
```

### 标签名称标准化

```typescript
export default defineConfig({
  tags: {
    tagTransform: (tag) => {
      // 统一转为小写并移除空格
      return tag.toLowerCase().replace(/\s+/g, '-');
    },
    excludeTags: ['temp', 'draft'], // 排除临时标签
  }
});
```

## 生成的页面

插件会生成以下页面：

- **`/tags`** - 标签索引页面，包含标签云和完整标签列表
- **`/tags/{tag-slug}`** - 单个标签页面，显示该标签下的所有文章

## 虚拟模块

在主题组件中访问标签数据：

```typescript
// 在主题组件中使用
import { 
  allTags, 
  tagMap, 
  getTagBySlug, 
  getRelatedTags,
  calculateTagWeight 
} from 'virtual-tags-data';

function TagCloudComponent() {
  return (
    <div>
      {allTags.map(tag => (
        <a key={tag.slug} href={tag.route}>
          {tag.name} ({tag.count})
        </a>
      ))}
    </div>
  );
}
```

## UI 组件

配合 `@cogita/ui` 包使用标签组件：

```typescript
import { TagCloud, TagList } from '@cogita/ui';

// 标签云组件
<TagCloud 
  tags={allTags}
  config={{
    minFontSize: 14,
    maxFontSize: 28,
    limit: 30
  }}
/>

// 标签列表组件
<TagList 
  tags={['React', 'JavaScript', 'TypeScript']}
  variant="badge"
  linkPrefix="/tags"
/>
```

## TypeScript 支持

完整的 TypeScript 支持：

```typescript
import type { 
  TagData, 
  TagsConfig, 
  TagCloudConfig,
  PostReference,
  TagStats 
} from '@cogita/plugin-tags';
```

## 故障排除

### 标签页面未生成

1. 确保 `@cogita/plugin-posts-frontmatter` 已正确加载
2. 检查文章的 frontmatter 格式是否正确
3. 验证标签配置是否启用：`tags: { enabled: true }`

### 中文标签路由问题

1. 确保服务器支持中文 URL 编码
2. 检查 `tagTransform` 函数是否正确处理中文
3. 验证生成的 slug 是否符合 URL 规范

### 标签数据为空

1. 检查文章目录是否正确：`posts: { dir: 'your-posts-dir' }`
2. 确认文章包含有效的 tags 字段
3. 检查是否被 `excludeTags` 过滤

## 示例

查看 [插件设计文档](../../docs/plugins/plugin-tags-design.md) 获取详细架构和更多示例。

## 许可证

MIT License. 查看 [LICENSE](./LICENSE) 了解详情。

## 贡献

欢迎贡献！请阅读我们的 [贡献指南](../../CONTRIBUTING.md)。
