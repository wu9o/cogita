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
