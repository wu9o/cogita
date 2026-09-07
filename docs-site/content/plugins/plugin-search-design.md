---
title: Search plugin design
---

# Search plugin design

`@cogita/plugin-search` provides a reusable local content index and a `/search` page. It is built on the shared `ContentIndex` and does not replace Rspress's default document-search experience.

## Goals and boundary

- Generate normalized search documents at build time and query them in the browser.
- Index titles, summaries, tags, and categories by default; require an explicit opt-in for full text.
- Let themes own the input, result cards, highlighting, and interaction design.
- Keep Rspress search modules untouched.
- Keep analytics disabled by default and avoid unsolicited third-party network requests.

The first release does not include server-side search, external search services, result pagination, or complex Boolean queries.

## Configuration

```ts
export default defineConfig({
  search: {
    enabled: true,
    routePrefix: 'search',
    includeContent: true,
    maxContentLength: 12_000,
    maxResults: 20,
    fields: {
      title: true,
      description: true,
      tags: true,
      categories: true,
      content: true,
    },
  },
});
```

`analytics.enabled` is off by default. Even when enabled, query and filter details require separate opt-ins so search terms do not enter an event accidentally.

## Data contract

```ts
interface SearchDocument {
  id: string;
  title: string;
  route: string;
  url: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  content?: string;
  createDate: string;
  updateDate: string;
  image?: string;
  imageAlt?: string;
}
```

`virtual-search-data` exposes `searchConfig`, `searchDocuments`, and `searchIndexHash`. The document `id` is the post route, which keeps search results connected to posts, categories, and lists.

## Page and theme contract

The plugin adds a `/search` page and a `pageLayouts.search` layout. The Lucid theme supports keyword highlighting, tag and category filters, `q`/`tag`/`category` URL state, empty-query guidance, and sub-path deployment through `site.base`.

When full-text indexing is enabled, the plugin removes frontmatter, fenced code, and HTML tags before truncating to `maxContentLength` and producing nearby context. Highlighted text must render as safe React nodes.

## Architecture relationship

Search, blog-list, tags, categories, and sitemap should share one content index and one route calculation. Search owns the index and page contract; it does not own the theme layout or a second content scan.

## Acceptance criteria

- An unconfigured search plugin does not change existing site output.
- Configuring search creates `/search`, and non-English titles, tags, and categories remain searchable.
- Full-text content respects the configured limit and excludes frontmatter and code blocks from excerpts.
- `/cogita/search.html` and result links work under the site base path.
- SEO includes the search entry point while the sitemap excludes dynamic query URLs.
- Analytics has no network side effect and only emits explicitly enabled fields.

See the [content index design](../api/content-index-design.html), [plugin API specification](./plugin-api-specification.html), and [Chinese version](../zh-CN/plugins/plugin-search-design.html).
