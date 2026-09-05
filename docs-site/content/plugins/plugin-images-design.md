---
title: Image plugin design
---

# Image plugin design

`@cogita/plugin-images` provides image discovery, cover metadata, and stable runtime data for themes. It solves the foundation—images display reliably, paths can be checked, and themes can reuse the same metadata. Compression, format conversion, and responsive images belong to a later optimization plugin.

## Position in the ecosystem

| Package | Responsibility |
| --- | --- |
| `@cogita/plugin-images` | Discover assets, resolve paths, read metadata, and associate covers with posts |
| `@cogita/plugin-image-optimization` | Compression, WebP/AVIF, responsive sizes, and caching |

The first package does not replace Rspress Markdown image handling or force a native image-processing dependency on every site.

## Asset boundary

Theme covers and runtime images come from `public/images`. Relative images inside an article remain in the native Rspress asset pipeline:

```text
blog/
├── public/images/          # Runtime theme images, for example /images/cover.png
└── posts/article-slug/
    ├── index.md
    └── assets/              # Article-local images handled by Rspress
```

The default extensions are `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.avif`, and `.svg`. During production builds the plugin copies the scanned public image directory. Dead relative-image checks use Rspress `markdown.image.checkDeadImages`.

## Frontmatter covers

```yaml
---
title: "An article title"
image: "/images/cover.png"
imageAlt: "Description of the article cover"
imageCaption: "A caption for the cover"
---
```

`image` accepts a public logical path or an external URL. `imageAlt` and `imageCaption` are optional display metadata. When alternative text is missing, a title or filename can be used as a fallback; strict mode can turn the condition into a diagnostic.

## Build data and runtime data

Absolute file paths must remain inside the build process and must never be written to a virtual module. Build-time code may retain `filePath`, dimensions, and source information. Themes receive a path-safe `ImageData` shape:

```ts
export interface ImageData {
  src: string;
  relativePath?: string;
  name?: string;
  extension?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  source: 'public' | 'external';
  postRoute?: string;
}
```

The plugin exposes `allImages`, `postCovers`, and `imageUsage` through `virtual-images-data`, together with lookup and unused-image helpers. Even when no images exist, the plugin should register empty arrays and maps so zero-configuration themes can import the module safely.

## Path rules

| Input | Handling |
| --- | --- |
| Markdown `./assets/diagram.png` | Let Rspress create the asset import |
| Frontmatter `/images/logo.png` | Resolve from the public image directory and keep the logical path |
| `https://example.com/a.png` | Treat as an external URL; do not scan or copy it |

The virtual module must not prepend `site.base` to `src`. Runtime components use Rspress `normalizeImagePath` for sub-path deployments. `builderConfig.output.assetPrefix` is a CDN build setting and must not be treated as the site base.

## Configuration

```ts
export interface ImagesConfig {
  enabled?: boolean;
  dir?: string;
  extensions?: string[];
  readDimensions?: boolean;
  failOnMissing?: boolean;
  warnOnMissingAlt?: boolean;
}
```

The default directory is `public/images`. Core fills defaults in the enhanced configuration before passing them to the plugin; the plugin should not reread the user configuration file.

## Lifecycle and integration

During `beforeBuild`, the plugin scans public images, resolves covers, reads dimensions, and validates paths. During `addRuntimeModules`, it emits stable `virtual-images-data`. It does not need `addPages`, because images are not standalone pages; public asset copying completes in `afterBuild`.

The plugin should obtain post routes and frontmatter through the shared `ContentIndex`, rather than reading another plugin's runtime virtual module. Core owns configuration and build context. Themes declare the plugin and choose the cover layout.

Lucid and `@cogita/ui` can use a small `PostCover` or `ImageFigure` component with `src`, `alt`, dimensions, and captions. Use a native `<img>` and CSS Modules. Do not render an empty cover slot when a post has no cover. A later optimization plugin can add `srcset` and `<picture>` at this component boundary.

## Boundaries and next steps

- The plugin owns image data; themes own visual presentation.
- Runtime URLs and local file paths stay separate so generated assets never reveal a developer machine.
- Article-body images remain in Rspress; the plugin does not duplicate Markdown AST scanning.
- Future work can add responsive images, compression, format conversion, caching, and an image diagnostics report.

See the [plugin API specification](./plugin-api-specification.html), [plugin development guide](./plugin-development.html), and [Chinese version](../zh-CN/plugins/plugin-images-design.html) for the surrounding extension contracts.
