---
title: RSS plugin design
---

# RSS plugin design

`@cogita/plugin-rss` generates RSS 2.0, Atom, and JSON Feed from the shared `ContentIndex`, then injects feed-discovery links into HTML. It makes a blog consumable by readers, aggregators, and automation tools.

## Capabilities

- Generate RSS 2.0, Atom, and JSON Feed.
- Configure formats, output paths, item limits, and full-content inclusion.
- Map custom author and category fields.
- Add `rel="alternate"` feed links to generated pages.
- Respect site language and `base` path settings.

## Configuration

```ts
export default defineConfig({
  rss: {
    title: 'My Blog Feed',
    description: 'Latest articles',
    link: 'https://example.com',
    language: 'en-US',
    formats: ['rss', 'atom', 'json'],
    maxItems: 20,
    includeContent: true,
  },
});
```

`feedPath`, `atomPath`, and `jsonPath` default to `rss.xml`, `atom.xml`, and `feed.json`. Core passes the normalized configuration to the plugin; the plugin should not reread the config file.

## Data flow

```text
ContentIndex → feed item mapping → RSS/Atom/JSON → static output + HTML discovery links
```

The plugin uses the Core index first. A legacy or standalone integration may retain a frontmatter-scan fallback. Routes, titles, summaries, publication dates, and public URLs must come from the shared content data.

## Lifecycle and boundary

`beforeBuild` normalizes configuration and prepares feed metadata. `addPages` writes static feed files. `addRuntimeModules` can expose feed URLs, while the HTML hook adds discovery links. The plugin does not own post scanning, theme layout, or a client-side subscription UI.

The generator must escape XML and JSON fields correctly and use public URLs that respect the site `base`; `assetPrefix` is not a feed path. A site with no posts should still receive valid empty feeds.

## Compatibility and verification

Feed items should use stable `guid` values, absolute public links, and ISO or HTTP date formats. After a build, verify that all configured formats exist, XML parses successfully, links do not contain local filesystem paths, and discovery links work under a sub-path deployment.

See the [content index design](../api/content-index-design.html), [plugin API specification](./plugin-api-specification.html), and [Chinese version](../zh-CN/plugins/plugin-rss-design.html) for the surrounding contracts.
