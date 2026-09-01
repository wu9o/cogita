---
title: JSON 内容源适配器
---

# JSON 内容源适配器

`@cogita/plugin-content-source-json` 是一个构建期内容源适配器示例。它读取站点仓库中的 JSON 快照，
将文章或普通文档转换为统一 `ContentIndex` 条目，并在记录包含 `content` 时提供正文读取能力。

## 配置

```ts
import { defineConfig } from '@cogita/core';
import { createJsonContentSource } from '@cogita/plugin-content-source-json';

export default defineConfig({
  contentSources: [
    createJsonContentSource({
      id: 'field-notes-export',
      file: 'content/field-notes.json',
    }),
  ],
});
```

JSON 可以是记录数组，也可以是 `{ "entries": [] }`。记录至少需要 `kind`、`title`、`route` 和
`updateDate`；`post` 还需要 `createDate`。`id` 用于生成缺省的稳定 `source://` 标识，`content` 用于
提供 Markdown 正文。

## Demo

Knowledge Demo 使用 `demos/knowledge/content/field-notes.json` 展示外部条目如何进入首页、搜索、标签和
内容关系。构建后访问 `/demos/knowledge/`，搜索“外部来源”或打开“从外部来源回到现场”，可以看到它和
现有文章共享同一套知识入口。

这个适配器读取的是提交到仓库的静态快照，不会在浏览器请求 JSON。要接入 Git、CMS 或 API 时，可以
沿用 `ContentSource` 契约实现自己的构建期同步逻辑。
