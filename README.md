# Cogita

**A theme-driven static site framework for blogs, docs, and knowledge bases.**

[Online handbook](https://wu9o.github.io/cogita/) · [Theme demos](https://wu9o.github.io/cogita/demos/) · [中文文档](https://wu9o.github.io/cogita/zh-CN/)

Cogita turns themes into complete content ecosystems. A theme defines the reading experience, plugins provide capabilities, and the site owns its content and configuration.

Choose a site shape first:

- [Docs](https://wu9o.github.io/cogita/demos/docs/) for handbooks and API references.
- [Lucid](https://wu9o.github.io/cogita/demos/lucid/) for personal notes and publishing archives.
- [Editorial](https://wu9o.github.io/cogita/demos/editorial/) for feature-led technical writing.
- [Knowledge](https://wu9o.github.io/cogita/demos/knowledge/) for connected content from posts, JSON, and Git sources.

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita/core)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)
[![CI](https://github.com/wu9o/cogita/workflows/CI/badge.svg)](https://github.com/wu9o/cogita/actions/workflows/ci.yml)

## Why Cogita

- **Theme-driven**: choose a complete site experience instead of assembling unrelated plugins.
- **Progressive**: start with a small config and add only the capabilities your site needs.
- **Composable**: themes declare their plugin dependencies and plugins communicate through public contracts.
- **Content-first**: write Markdown, connect content sources, and keep site code separate from framework packages.
- **Type-safe**: use TypeScript configuration and shared public types.
- **English-first**: official themes, demos, onboarding, and documentation entry points are ready for public evaluation.

## Quick start

Start from an official template:

```bash
pnpm dlx @cogita/cli create my-site --template knowledge
cd my-site
pnpm dev
```

Available templates include `blog`, `docs`, `knowledge`, and `knowledge-external`. The last one connects JSON or Git content sources to a Knowledge site.

For a custom site:

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-lucid
```

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Site',
    description: 'A site built with Cogita.',
    url: 'https://example.com',
  },
  posts: { dir: 'posts' },
  theme: '@cogita/theme-lucid',
});
```

Then run `pnpm exec cogita dev` and add Markdown under `posts/` or `content/`.

## Official themes

| Theme | Best for | Main strengths |
| --- | --- | --- |
| [`@cogita/theme-docs`](./themes/docs) | Handbooks and references | Navigation, sidebars, focused reading |
| [`@cogita/theme-lucid`](./themes/lucid) | Blogs and notes | Lightweight publishing, topics, archives |
| [`@cogita/theme-editorial`](./themes/editorial) | Feature writing | Strong hierarchy, series, curated stories |
| [`@cogita/theme-knowledge`](./themes/knowledge) | Wikis and research notes | Search, topics, backlinks, mixed sources |

Every official theme has an independent consumer under [`demos/`](./demos/). Build all four demos locally with:

```bash
pnpm install
pnpm run demo
```

Open `http://localhost:3100/` to compare the four site shapes. Each demo uses its own configuration and sample content; none depends on the personal `blog/` project.

## Plugin ecosystem

Cogita includes plugins for posts, RSS, topics, categories, collections, search, SEO, sitemaps, images, reading progress, code copying, comments, content checks, and JSON or Git content sources. [`@cogita/plugin-i18n`](./plugins/i18n) provides locale-aware UI copy with English as the safe fallback.

The extension boundary is intentionally simple:

```text
site config → Core → theme → plugins → static output
```

Themes own page composition. Plugins own capabilities and their configuration namespaces. Site-specific rules remain in the site repository.

## Documentation

- [Online handbook](https://wu9o.github.io/cogita/)
- [Getting started](./docs-site/content/getting-started.md)
- [Best practices](./docs-site/content/guides/best-practices.md)
- [Deployment guide](./docs-site/content/guides/deployment.md)
- [Plugin development](./docs-site/content/plugins/plugin-development.md)
- [API reference](./docs-site/content/api/api-reference.md)
- [Architecture design](./docs-site/content/api/architecture-design.md)
- [Roadmap](./ROADMAP.md)

The handbook also provides a native `English / 中文` route switcher. The Chinese entry point is available at [`/zh-CN/`](./docs-site/content/zh-CN/index.md); pages without a completed translation safely fall back to the English source.

## Development

Requirements: Node.js 18 or newer and pnpm 9 or newer.

```bash
pnpm install
pnpm run build:packages
pnpm run test
pnpm run check
```

Use [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution conventions. Published package changes should include a Changeset.

## Project status

The core architecture, official themes, plugin library, independent demos, English-first public surfaces, and adoption checks are in place. The next improvements will be driven by real user feedback: starter templates, examples, and the first community-requested theme or plugin.

## Community and license

- [Issues](https://github.com/wu9o/cogita/issues)
- [Discussions](https://github.com/wu9o/cogita/discussions)
- [Contributing guide](./CONTRIBUTING.md)

MIT © [wu9o](https://github.com/wu9o)
