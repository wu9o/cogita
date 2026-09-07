---
title: JSON content source adapter
---

# JSON content source adapter

`@cogita/plugin-content-source-json` is a build-time content source example. It reads a local or remote JSON snapshot, converts posts and documents into shared `ContentIndex` entries, and provides body access when a record contains `content`.

## Configuration

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

JSON can be an array of records or `{ "entries": [] }`. Each record needs `kind`, `title`, `route`, and `updateDate`; a `post` also needs `createDate`. `id` creates a stable `source://` identifier and `content` supplies the Markdown body.

## Remote JSON and demo

Replace `file` with `url` to read the same snapshot format from GitHub Raw, object storage, or an export API:

~~~ts
createJsonContentSource({
  id: 'team-notes',
  url: process.env.TEAM_NOTES_URL,
  headers: { Authorization: `Bearer ${process.env.TEAM_NOTES_TOKEN}` },
});
~~~

Requests happen at build time, so authentication data is never exposed to the browser. The Knowledge demo uses `demos/knowledge/content/field-notes.json` to show how external entries flow into the home page, search, tags, and content relations. Pagination, incremental sync, retries, and complex authentication belong in a site-specific `ContentSource`.

For the Chinese version, see [JSON 内容源适配器](../zh-CN/plugins/plugin-content-source-json-design.html).
