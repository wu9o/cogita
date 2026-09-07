---
title: Categories plugin design
---

# Categories plugin design

`@cogita/plugin-categories` turns frontmatter `categories` into a category index, detail pages, and hierarchical navigation. Categories support parent and child paths; unlike collections, they do not require reading order or a series relationship.

## Category declaration

```yaml
---
categories:
  - frontend/React
  - engineering
---
```

The default hierarchy separator is `/`. Declaring `frontend/React` creates both `frontend` and `frontend/React`; the parent aggregates posts from its descendants. Flat category names remain valid.

## Configuration and data

```ts
export default defineConfig({
  categories: {
    enabled: true,
    routePrefix: 'categories',
    separator: '/',
    minPostCount: 1,
    sortBy: 'name',
  },
});
```

`virtual-categories-data` exposes `allCategories`, `categoryMap`, slug lookup, post lookup, breadcrumbs, and category statistics.

## Pages and boundary

| Route | Page |
| --- | --- |
| `/categories` | Category index |
| `/categories/:slug` | Category detail |
| `/categories/:parent/:child` | Nested category detail |

The plugin owns build-time extraction, the category tree, static routes, and runtime data. Themes own presentation and post lists. SEO owns page metadata, while sitemap includes category pages only when the capability is explicitly enabled.

When categories are not configured, the plugin returns `null` and existing site output remains unchanged. The next architecture step is to have categories share the Core `ContentIndex` with tags and search instead of parsing frontmatter independently.

See the [content index design](../api/content-index-design.html), [plugin API specification](./plugin-api-specification.html), and [Chinese version](../zh-CN/plugins/plugin-categories-design.html).
