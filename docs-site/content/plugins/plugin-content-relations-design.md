---
title: Content relations plugin design
---

# Content relations plugin design

`@cogita/plugin-content-relations` is foundational infrastructure for a knowledge site. It consumes the shared `ContentIndex` injected by Core and turns local Markdown links into reusable relation data. It does not render a theme or create standalone pages.

## Goals

- Generate outgoing links and backlinks for site content.
- Provide related-content and navigation data to the Knowledge theme.
- Reuse `ContentIndex` without scanning and parsing the same files again.
- Ignore external URLs, anchors, image syntax, and code examples.
- Skip unresolved targets quietly and leave broken-link diagnostics to `content-check`.

## Usage

```ts
import { defineConfig } from '@cogita/core';
import { pluginContentRelations } from '@cogita/plugin-content-relations';

export default defineConfig({
  contentRelations: { enabled: true },
  plugins: [pluginContentRelations],
});
```

The plugin exposes `getBacklinks`, `getOutgoingLinks`, and `getRelatedContent` through `virtual-content-relations-data`:

```ts
import {
  getBacklinks,
  getOutgoingLinks,
  getRelatedContent,
} from 'virtual-content-relations-data';

const backlinks = getBacklinks('/posts/current');
const outgoing = getOutgoingLinks('/posts/current');
const related = getRelatedContent('/posts/current');
```

## Current boundary

The current implementation handles posts and ordinary `contentDir` documents in the shared index. Both are represented as `ContentEntry` values. Relation kinds, source locations, and custom content collections are intentionally not part of the first contract.

The plugin provides data but does not decide where backlinks or related content appear in a page. It does not introduce a graph database, client-side graph visualization, or CMS dependency.

## Extension path

1. Bring frontmatter knowledge entries and more external sources into the shared content-entry model.
2. Add relation kinds and source locations to the relation contract.
3. Let `@cogita/theme-knowledge` consume the index, search module, and relation module.
4. Validate root paths, sub-path deployments, broken-link diagnostics, and backlink pages through an independent knowledge-site Demo.

See the [content index design](../api/content-index-design.html), [plugin API specification](./plugin-api-specification.html), and [Chinese version](../zh-CN/plugins/plugin-content-relations-design.html) for the surrounding contracts.
