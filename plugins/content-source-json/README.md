# @cogita/plugin-content-source-json

将 JSON 导出内容接入 Cogita 的统一 `ContentIndex`，适合作为 Git、API 或其他知识库导出的稳定快照适配器。

## 使用

```bash
pnpm add @cogita/plugin-content-source-json
```

```ts
import { defineConfig } from '@cogita/core';
import { createJsonContentSource } from '@cogita/plugin-content-source-json';

export default defineConfig({
  contentSources: [
    createJsonContentSource({
      id: 'research-notes',
      file: 'content/research-notes.json',
    }),
  ],
});
```

JSON 可以是数组，也可以是 `{ "entries": [] }`。每条记录至少包含 `kind`、`title`、`route` 和 `updateDate`；
`post` 还需要 `createDate`。`filePath` 可选，缺省时会生成 `source://<source-id>/<id>`；`content` 是可选的
Markdown 正文，提供后即可被搜索全文和内容关系插件读取。

```json
[
  {
    "id": "remote-note",
    "kind": "document",
    "title": "远程笔记",
    "route": "/notes/remote-note",
    "updateDate": "2026-08-25T00:00:00.000Z",
    "tags": ["研究"],
    "content": "# 远程笔记\n\n正文"
  }
]
```

这是一个构建期适配器，不会在浏览器中请求 JSON。需要实时拉取 API 时，可以复用同一个 `ContentSource`
契约实现自己的网络适配器，并在构建环境中管理认证和缓存。
