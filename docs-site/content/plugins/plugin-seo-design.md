# SEO plugin architecture

## Goal

`@cogita/plugin-seo` injects page-level SEO metadata during the build for the home page, posts, and other generated routes. It completes the page descriptions and social-sharing layer that sits alongside the sitemap.

The first release has no client runtime component and does not change article rendering. It only generates static HTML head tags.

## Configuration

```ts
export default defineConfig({
  site: {
    title: 'My blog',
    description: 'Notes on technology and practice',
    url: 'https://example.com/blog/',
    base: '/blog/',
  },
  seo: {
    enabled: true,
    defaultImage: '/images/social-card.png',
    defaultImageAlt: 'Default social sharing image',
    author: 'Author name',
    twitterCard: 'summary_large_image',
    twitterSite: '@example',
    twitterCreator: '@author',
    includeJsonLd: true,
    audit: {
      enabled: true,
      reportPath: 'seo-report.json',
      failOnError: false,
    },
  },
});
```

Without `seo`, the plugin returns `null` and leaves existing HTML unchanged. When enabled, the static Rspress description is replaced with a page-specific description.

## Per-post fields

Posts can override the defaults with nested `seo` frontmatter:

```yaml
seo:
  title: Custom sharing title
  description: Custom search summary
  canonical: /posts/custom-canonical
  image: /images/custom-card.png
  imageAlt: Description of the sharing card
  noindex: false
  author: Author name
```

Existing `title`, `description`, `excerpt`, `image`, `imageAlt`, and `author` fields remain valid. The priority is nested `seo` fields, ordinary post fields, then site defaults.

## Build flow

```text
Cogita config
    ↓
Core normalizes the SEO config
    ↓
The SEO config hook reads post frontmatter
    ↓
Rspress config.head injects static tags by routePath
    ↓
HTML, Open Graph, Twitter Card, and JSON-LD are generated
```

Rspress 1.45 provides a route callback for `config.head`, so the plugin can generate metadata per page without rewriting HTML files or depending on a runtime virtual module.

## SEO audit

The audit reuses the metadata collected by the `config` hook and checks the home page and post pages:

- title, description, and canonical must exist;
- descriptions shorter than 50 characters produce a warning;
- an image must have `imageAlt`;
- posts are advised to provide an author.

The audit reports by default without blocking the build. With `audit.failOnError: true`, missing title, description, or canonical fails the build. With `audit.reportPath`, a JSON report is written to the build output for CI and follow-up tools.

The report follows the shared quality-report schema. Besides the retained `pageCount`, it includes `reportType: "seo-audit"`, `itemCount`, `errors`, `warnings`, and `issues`. It can be passed with `content-report.json` to `scripts/check-quality-reports.mjs`, which aggregates the gate and emits GitHub annotations.

## Generated metadata

Post pages include:

- `description` and `robots`;
- `canonical` and `og:url`;
- `og:type`, `og:title`, `og:description`, and `og:image`;
- `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`;
- `author`;
- Article JSON-LD.

The home page uses WebSite JSON-LD. Other pages use site defaults. `site.base` participates in absolute URL construction, and an external image URL is never prefixed twice.

## Architecture boundary

The SEO plugin registers page head data through the `config` hook and uses Core's `ContentIndex` in `beforeBuild` to produce page metadata. This lets the index be invalidated before SEO rereads posts and avoids relying on the posts plugin's execution order. A standalone scan remains as a fallback for older Core or direct plugin usage.

Search is not reimplemented in SEO: Rspress already creates the local search index and entry point. Future work should extend the existing index with tags, collections, and search weighting.

For the Chinese version, see [SEO 插件架构设计](../zh-CN/plugins/plugin-seo-design.html).
