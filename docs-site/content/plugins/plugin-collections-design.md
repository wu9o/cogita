---
title: Collections plugin design
---

# Collections plugin design

`@cogita/plugin-collections` organizes posts into ordered series for tutorials, courses, and playlists. Tags are flat many-to-many labels; collections emphasize order, series metadata, and previous/next navigation.

## Frontmatter

```yaml
---
title: "Getting started with React Hooks"
collection: "react-hooks-series"
order: 1
---
```

`collection` is the collection slug and `order` controls ascending reading order. When no order is supplied, posts are sorted by creation date. `collectionTitle` can override a post title inside the series.

## Configuration

```ts
export default defineConfig({
  collections: {
    enabled: true,
    routePrefix: 'collections',
    metadata: {
      'react-hooks-series': {
        title: 'React Hooks series',
        description: 'A guided series from fundamentals to advanced patterns',
        cover: '/images/covers/react-hooks.png',
      },
    },
    minPostCount: 1,
  },
});
```

## Data and pages

`virtual-collections-data` exposes the collection list, slug lookup, post-route lookup, ordered posts, and collection statistics. The plugin generates `/collections` for the index and `/collections/:slug` for a series detail page.

Themes can provide `pageLayouts.collection` and `pageLayouts.collectionIndex`, plus collection cards, ordered post lists, breadcrumbs, and previous/next navigation. Lucid keeps the strongly theme-specific UI in the theme instead of forcing a generic component into `@cogita/ui`.

## Lifecycle and boundary

The plugin uses the shared post index and owns extraction, deduplication, ordering, runtime data, and static routes. Themes own presentation; SEO and sitemap own metadata and inclusion. An unconfigured capability preserves zero-configuration output.

Completed capabilities include collection pages, post-page collection navigation, dark mode, and the CLI preview command. Future extensions can add persisted reading progress, collection OG images, and per-collection RSS feeds.

The design uses frontmatter instead of directory structure so posts can move without breaking the content model. Version one uses one `collection` field; a multi-collection array can be considered later.

See the [content index design](../api/content-index-design.html), [plugin API specification](./plugin-api-specification.html), and [Chinese version](../zh-CN/plugins/plugin-collections-design.html).
