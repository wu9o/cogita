---
title: Knowledge theme
---

# Knowledge theme

`@cogita/theme-knowledge` is designed for personal wikis, technical research notes, and long-term knowledge bases that combine posts with handbooks. Its goal is not to provide another blog skin, but to turn connections between pieces of content into a durable browsing entry point.

## Minimal configuration

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
~~~

The theme enables local search, topics, and content relations by default, and declares content quality diagnostics as an optional capability. When both `posts` and `contentDir` exist, the home and search pages show both content types; content pages show outgoing and incoming links at the bottom. When `contentCheck` is configured explicitly, posts and ordinary documents produce one shared quality report.

## Boundary with other themes

- `@cogita/theme-docs` focuses on directory navigation and document reading.
- `@cogita/theme-lucid` focuses on continuous publishing and blog archives.
- `@cogita/theme-knowledge` focuses on cross-source discovery and knowledge recall.

The theme consumes `virtual-search-data`, `virtual-tags-data`, and `virtual-content-relations-data`; it does not scan files directly. To extend knowledge sources, add them through `contentSources` or an independent plugin that feeds the shared `ContentIndex`, then let the theme consume the stable data contract.