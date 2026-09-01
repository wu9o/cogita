---
title: Package and capability map
---

# Package and capability map

Cogita splits framework capabilities into independently publishable packages. A site installs only what it uses instead of adding every plugin to its dependency graph.

## Core packages

| Package | Responsibility | Install directly in a site |
| --- | --- | --- |
| `@cogita/core` | Load configuration, resolve themes, and assemble Rspress | Yes |
| `@cogita/cli` | Provide `dev`, `build`, and `preview` commands | Yes |
| `@cogita/shared` | Shared types and build-time context | Usually consumed indirectly |
| `@cogita/ui` | Reusable foundation UI components | As needed |

## Theme packages

| Package | Best for | Default focus |
| --- | --- | --- |
| `@cogita/theme-docs` | Project handbooks and technical documentation | Documentation navigation, home entry points, and technical content |
| `@cogita/theme-lucid` | Personal blogs and content sites | Post lists, archives, search, and blog interactions |
| `@cogita/theme-editorial` | Editorial content sites | Featured writing and content browsing |
| `@cogita/theme-knowledge` | Personal wikis, research notes, and mixed knowledge bases | Unified content, search, topics, and backlinks |

Themes are not merely CSS skins. They declare page layouts through `pageLayouts` and default capabilities through `plugins`.

## Plugin packages

| Capability | Package |
| --- | --- |
| Post metadata and content index | `@cogita/plugin-posts-frontmatter` |
| Content relations and backlinks | `@cogita/plugin-content-relations` |
| External JSON content source | `@cogita/plugin-content-source-json` |
| Independent Git Markdown source | `@cogita/plugin-content-source-git` |
| Post lists and archives | `@cogita/plugin-blog-list` |
| Topics, categories, and collections | `@cogita/plugin-tags`, `@cogita/plugin-categories`, `@cogita/plugin-collections` |
| Search, reading progress, and code copy | `@cogita/plugin-search`, `@cogita/plugin-reading-progress`, `@cogita/plugin-code-copy` |
| Images, SEO, sitemap, and RSS | `@cogita/plugin-images`, `@cogita/plugin-seo`, `@cogita/plugin-sitemap`, `@cogita/plugin-rss` |
| Comments and content checks | `@cogita/plugin-comments`, `@cogita/plugin-content-check` |

Plugins use structured configuration namespaces such as `config.search`, `config.comments`, and `config.images`. Without matching configuration or a theme layout, a plugin should degrade gracefully instead of forcing blog capabilities onto every site.

## Selection guide

- For a project handbook: install `@cogita/theme-docs` and configure `contentDir`.
- For a personal blog: install `@cogita/theme-lucid` and configure `posts` plus the post plugins you need.
- For a knowledge base: install `@cogita/theme-knowledge`, then configure `posts`, `contentDir`, and source adapters as needed.
- For a custom site: start with a theme and add site plugins or theme extensions.
- For shared functionality: create an independent plugin instead of putting site business logic into a theme or Core.