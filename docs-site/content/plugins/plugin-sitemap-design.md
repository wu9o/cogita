# Sitemap plugin architecture

## Goal

`@cogita/plugin-sitemap` generates a standard `sitemap.xml` during a static build so search engines can discover the home page, posts, and other public routes configured by the site.

The plugin only collects build-time data and writes XML. It adds no runtime virtual module and does not change theme rendering. Absolute URLs are derived from `site.url` and `site.base`.

## Configuration

```ts
export default defineConfig({
  site: {
    url: 'https://example.com/blog/',
    base: '/blog/',
  },
  sitemap: {
    enabled: true,
    path: 'sitemap.xml',
    includeHome: true,
    includePosts: true,
    changefreq: 'weekly',
    priority: 0.7,
    customUrls: [{ path: '/about', priority: 0.5 }],
  },
});
```

Without `sitemap`, the plugin returns `null` and preserves the zero-config behavior. When enabled without `site.url`, strict mode fails the build; non-strict mode warns and skips generation.

## Build flow

```text
Cogita config
    ↓
Core normalizes the sitemap config
    ↓
beforeBuild scans post frontmatter and creates absolute URLs and lastmod
    ↓
Rspress builds HTML
    ↓
afterBuild writes doc_build/sitemap.xml
```

The sitemap reads Core's `ContentIndex` first and reuses the shared post-list route contract. Because Rspress plugin `beforeBuild` hooks run in parallel, it does not read `virtual-posts-data` or rely on another plugin's execution order. An independent scan remains as a fallback when no shared index is available.

## URL rules

- `site.url` provides the domain and any deployment path already present.
- `site.base` fills in the deployment path when it is absent from `site.url`.
- Post routes come from `posts.routePrefix` and the post file path.
- Custom URLs support both site routes such as `/about` and complete HTTP(S) URLs.
- Entries are deduplicated by `loc` and sorted deterministically.

## Output and safety

- The default output is `sitemap.xml` inside the build directory.
- `path` cannot escape the build output directory.
- XML text is escaped consistently so query parameters and custom URLs cannot corrupt the document.
- `lastmod` only contains parseable dates.
- `priority` is clamped to 0 through 1.

## Future work

The first release does not include image sitemaps, multilingual indexes, or a sitemap index. The SEO plugin can later reuse the sitemap's normalized URL helper. Route inclusion should also respect theme layout capability so the sitemap never advertises a route that would render a 404.

For the Chinese version, see [站点地图插件架构设计](../zh-CN/plugins/plugin-sitemap-design.html).
