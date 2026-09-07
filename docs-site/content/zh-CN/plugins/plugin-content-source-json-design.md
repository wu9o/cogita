---
title: JSON 内容源适配器
---

# JSON 内容源适配器

`@cogita/plugin-content-source-json` 是构建期内容源适配器示例。它读取本地或远程 JSON 快照，将文章或普通文档转换为统一 `ContentIndex` 条目，并在记录包含 `content` 时提供正文读取能力。

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

JSON 可以是记录数组，也可以是 `{ "entries": [] }`。记录至少需要 `kind`、`title`、`route` 和 `updateDate`；`post` 还需要 `createDate`。`id` 用于生成稳定的 `source://` 标识，`content` 用于提供 Markdown 正文。

## 远程 JSON 与 Demo

将 `file` 替换为 `url` 即可从 GitHub Raw、对象存储或导出 API 读取同一格式的快照：

~~~ts
createJsonContentSource({
  id: 'team-notes',
  url: process.env.TEAM_NOTES_URL,
  headers: { Authorization: `Bearer ${process.env.TEAM_NOTES_TOKEN}` },
});
~~~

请求发生在构建期，不会在浏览器运行时暴露认证信息。Knowledge Demo 使用 `demos/knowledge/content/field-notes.json` 展示外部条目如何进入首页、搜索、标签和内容关系。分页、增量同步、重试和复杂认证应由站点自定义 `ContentSource` 实现。
