---
title: 知识主题
---

# 知识主题

`@cogita/theme-knowledge` 面向个人 Wiki、技术研究笔记和长期知识库，适合把文章与手册放在同一个内容空间中。它的重点不是再做一套博客皮肤，而是把内容之间的联系变成可持续的浏览入口。

## 最小配置

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
```

主题默认启用本地搜索、主题标签和内容关系，并把内容质量诊断作为可选能力。当 `posts` 和 `contentDir` 同时存在时，首页与搜索页会展示两种内容；内容页底部会展示出链和反向链接。显式配置 `contentCheck` 后，文章和普通文档会共同生成一份质量报告。

## 与其他主题的边界

- `@cogita/theme-docs` 重点是目录导航和文档阅读。
- `@cogita/theme-lucid` 重点是持续发布和博客归档。
- `@cogita/theme-knowledge` 重点是跨来源发现和知识回溯。

主题消费 `virtual-search-data`、`virtual-tags-data` 和 `virtual-content-relations-data`，不会直接扫描文件。需要扩展知识来源时，应通过 `contentSources` 或独立插件接入共享 `ContentIndex`，再由主题消费稳定的数据契约。
