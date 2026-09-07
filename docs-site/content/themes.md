---
title: Theme overview
---

# Theme overview

Cogita themes are more than colors and typography. A theme owns page layouts, visual language, and a declared set of default plugin capabilities. A site selects a theme and supplies its content and navigation.

## Available themes

| Theme | Best for | Focus | Package |
| --- | --- | --- | --- |
| **Docs** | Handbooks, API references, knowledge bases | Navigation, code reading, page search | `@cogita/theme-docs` |
| **Lucid** | Personal blogs and archives | Posts, topics, search, reading flow | `@cogita/theme-lucid` |
| **Editorial** | Feature writing and series | Headlines, featured content, editorial rhythm | `@cogita/theme-editorial` |
| **Knowledge** | Wikis, research notes, mixed repositories | Unified content, search, topics, backlinks | `@cogita/theme-knowledge` |

Each theme has an independent consumer under [`demos/`](https://github.com/wu9o/cogita/tree/main/demos). Run `pnpm run demo` to build and preview all four.

## Theme demos

Try each theme with an independent site and custom sample content:

| Demo | What to look for | Link |
| --- | --- | --- |
| **Docs** | Handbook navigation, focused reading, and reference pages | [Open the Docs demo](https://wu9o.github.io/cogita/demos/docs/) |
| **Lucid** | A lightweight publishing flow for notes and archives | [Open the Lucid demo](https://wu9o.github.io/cogita/demos/lucid/) |
| **Editorial** | Feature-led storytelling and curated series | [Open the Editorial demo](https://wu9o.github.io/cogita/demos/editorial/) |
| **Knowledge** | Posts, documents, JSON, Git sources, and backlinks in one space | [Open the Knowledge demo](https://wu9o.github.io/cogita/demos/knowledge/) |

The [full demo showcase](https://wu9o.github.io/cogita/demos/) is the fastest way to compare the four content experiences. Each demo is also included in this repository so you can inspect its configuration and sample content.

## Docs

Docs is designed for lookup and understanding. It provides chapter navigation, a focused reading area, and a page outline for handbooks, architecture notes, API references, and plugin documentation.

~~~ts
export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-docs',
});
~~~

## Lucid

Lucid is designed for continuous publishing and browsing. It emphasizes post lists, topics, categories, search, reading progress, and subscription entry points.

~~~ts
export default defineConfig({
  posts: { dir: 'posts', routePrefix: 'posts' },
  theme: '@cogita/theme-lucid',
});
~~~

## Editorial

Editorial is designed for series and narrative. It uses stronger heading hierarchy, featured posts, and card rhythm for project stories, research notes, and opinion-led content.

~~~ts
export default defineConfig({
  posts: { dir: 'posts', routePrefix: 'posts' },
  theme: '@cogita/theme-editorial',
});
~~~

## Knowledge

Knowledge is designed for connection and retrieval. It brings `posts` and `contentDir` into one content entry point and combines search, topics, content relations, and external JSON or Git sources.

~~~ts
export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
~~~

## How to choose

- Choose **Docs** when readers primarily follow navigation, code, and API references.
- Choose **Lucid** for a steady writing workflow with archives and search.
- Choose **Editorial** for feature stories, series, and a stronger reading rhythm.
- Choose **Knowledge** when posts, documents, and backlinks should live in one space.

All official themes are English-first and support `@cogita/plugin-i18n`. The interface can be translated through `i18n.messages` without rewriting article content.
