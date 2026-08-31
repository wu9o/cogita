---
title: 内容关系插件设计
---

# 内容关系插件设计

`@cogita/plugin-content-relations` 是知识库能力的第一层基础设施。它不负责渲染主题或生成独立页面，而是消费 Core 注入的共享内容索引，从 Markdown 本地链接生成可以被主题复用的关系数据。

## 目标

- 从站内 Markdown 链接生成出链和反向链接；
- 为知识库主题提供相关文章和内容导航数据；
- 复用 `ContentIndex`，不重复扫描和解析文章；
- 忽略外部链接、锚点、图片语法和代码示例；
- 对无法解析的目标保持静默跳过，将失效链接诊断交给 `content-check`。

## 使用

```ts
import { defineConfig } from '@cogita/core';
import { pluginContentRelations } from '@cogita/plugin-content-relations';

export default defineConfig({
  posts: { dir: 'posts', routePrefix: 'posts' },
  contentRelations: { enabled: true },
  plugins: [pluginContentRelations],
});
```

插件通过 `virtual-content-relations-data` 暴露以下运行时能力：

```ts
import {
  getBacklinks,
  getOutgoingLinks,
  getRelatedContent,
} from 'virtual-content-relations-data';
```

## 当前边界

当前版本处理 Core 共享索引中的文章和 `contentDir` 普通文档。两类内容都通过 `ContentEntry` 暴露，
但知识条目的关系类型、来源位置和自定义内容集合仍未进入契约。

关系插件只提供数据，不决定“相关文章”“反向链接”在页面上的位置，也不引入图数据库、客户端图可视化或 CMS 依赖。

## 后续扩展

1. 将带有 frontmatter 的知识条目和更多内容来源接入统一内容条目；
2. 为关系数据增加关系类型和来源位置；
3. 开发 `@cogita/theme-knowledge`，消费内容索引、搜索和关系模块；
4. 用独立知识库消费者验证根路径、子路径、断链诊断和反向链接页面。
