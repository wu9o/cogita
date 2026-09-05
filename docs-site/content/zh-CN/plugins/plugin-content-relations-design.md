---
title: 内容关系插件设计
---

# 内容关系插件设计

`@cogita/plugin-content-relations` 是知识库能力的基础插件。它消费 Core 注入的共享 `ContentIndex`，从 Markdown 本地链接生成主题可以复用的关系数据，不负责页面渲染或独立页面生成。

## 目标

- 生成站内内容的出链和反向链接；
- 为 Knowledge 主题提供相关文章和内容导航；
- 复用 `ContentIndex`，不重复扫描和解析；
- 忽略外部链接、锚点、图片语法和代码示例；
- 无法解析的目标静默跳过，把失效链接诊断交给 `content-check`。

## 使用

```ts
import { defineConfig } from '@cogita/core';
import { pluginContentRelations } from '@cogita/plugin-content-relations';

export default defineConfig({
  contentRelations: { enabled: true },
  plugins: [pluginContentRelations],
});
```

插件通过 `virtual-content-relations-data` 暴露 `getBacklinks`、`getOutgoingLinks` 和 `getRelatedContent`。

## 当前边界

当前版本处理共享索引中的文章和 `contentDir` 普通文档。插件只提供数据，不决定关系模块在页面上的位置，也不引入图数据库、客户端图可视化或 CMS 依赖。

## 后续扩展

1. 将带 frontmatter 的知识条目和更多来源接入统一内容条目；
2. 为关系数据增加关系类型和来源位置；
3. 由 `@cogita/theme-knowledge` 消费内容索引、搜索和关系模块；
4. 用独立知识库 Demo 验证根路径、子路径、断链诊断和反向链接页面。
