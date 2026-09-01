---
title: Knowledge 知识库主题
---

# Knowledge 知识库主题

`@cogita/theme-knowledge` 面向个人 Wiki、技术研究记录以及同时包含文章和手册的长期知识库。它的目标不是再提供一套博客皮肤，而是把内容和内容之间的连接组织成可持续浏览的入口。

## 最小配置

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
```

主题默认启用本地搜索、标签和内容关系，并声明可选的内容质量诊断。`posts` 与 `contentDir` 都存在时，首页和搜索页会展示两类内容，内容页尾部会展示出链和反向链接；显式配置 `contentCheck` 后，文章和普通文档会共同生成质量报告。

## 与其他主题的边界

- `@cogita/theme-docs` 优先解决目录导航和文档阅读；
- `@cogita/theme-lucid` 优先解决持续发布和博客归档；
- `@cogita/theme-knowledge` 优先解决跨来源内容发现和知识回溯。

主题消费 `virtual-search-data`、`virtual-tags-data` 和 `virtual-content-relations-data`，不直接扫描文件。需要扩展知识来源时，应先通过 `contentSources` 或独立插件接入统一 `ContentIndex`，再由主题消费新的稳定数据契约。
