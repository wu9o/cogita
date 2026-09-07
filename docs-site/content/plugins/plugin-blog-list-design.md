---
title: Blog List plugin architecture
---

# Blog List plugin architecture

## Goal

Blog List is Cogita's article list and archive plugin. It organizes post data into browsable, paginated, extensible static pages without rescanning the content source.

The plugin provides theme-neutral list data and routes. The theme owns visual presentation, while Core and `ContentIndex` remain the shared source of truth.

## Design principles

1. The plugin owns data and routes; themes own presentation.
2. Missing or disabled configuration returns `null` and preserves existing sites.
3. Existing `PostFrontmatter`, `Post`, and `ContentIndex` contracts are reused.
4. Pagination and archives are generated at build time instead of using client query state.
5. All generated links respect `site.base`, including subpath deployments.

## Scope

The first phase generates `/archive`, pagination, year-grouped archives, and `virtual-blog-list-data`. The second phase adds `/archive/tag/:slug`, `/archive/category/:slug`, filtered pagination, monthly archives, and filter navigation. Client-side full-text search, server APIs, drafts, comments, and image processing are outside this plugin.

## Configuration

```ts
export default defineConfig({
  blogList: {
    enabled: true,
    routePrefix: 'archive',
    pageSize: 10,
    sortBy: 'createDate',
    order: 'desc',
    generateArchives: true,
    archivePrefix: 'archives',
    archiveGranularity: 'year',
  },
});
```

`pageSize` must be at least 1, route prefixes cannot start with `/`, and unknown sort fields fall back to `createDate`. Core owns the defaults; the plugin performs final validation.

## Data flow and theme contract

```text
posts/*.md → PostFrontmatter → ContentIndex
→ sort, filter, paginate, and group
→ virtual-blog-list-data → BlogList / Archive layouts
```

The virtual module exposes list pages, filters, archives, and lookup functions. List entries preserve image metadata such as `imageAlt`, `imageCaption`, `imageWidth`, and `imageHeight`. Themes consume the data through `pageLayouts.blogList` and `pageLayouts.archive`.

Recommended routes include `/archive`, `/archive/page/2`, `/archives`, and `/archives/2026`. Lucid reuses `PostList` and cover components, keeps the latest-post home experience, and adds pagination, archive navigation, and an empty state.

## Implementation boundary and acceptance

The plugin lifecycle obtains the index, generates pages, and creates the virtual module. It does not modify global Rspress HTML or own SEO. A standalone parsing fallback remains for compatibility, while sorting, filtering, pagination, and archive grouping stay pure and testable.

Acceptance covers no empty pagination for a short list, correct previous/next links, accurate date grouping, successful empty-directory builds, valid subpath links, and unchanged behavior when `blogList` is not configured.

## Relationship to other modules

```text
plugin-posts-frontmatter → plugin-blog-list
                         ↙                 ↘
                plugin-categories      plugin-search
```

Blog List is the foundation for list experiences. Search and categories can reuse its normalized index, filtering, and pagination model.

For the Chinese version, see [Blog List 插件架构设计与实现方案](../zh-CN/plugins/plugin-blog-list-design.html).
