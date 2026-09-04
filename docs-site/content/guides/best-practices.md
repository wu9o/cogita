# Cogita best practices

This guide covers the conventions that keep a Cogita site easy to evolve: a clear repository boundary, small configuration, composable themes and plugins, reliable content, and a deployment path that can be diagnosed.

## Contents

- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Content authoring](#content-authoring)
- [Themes and plugins](#themes-and-plugins)
- [Performance and deployment](#performance-and-deployment)
- [SEO and accessibility](#seo-and-accessibility)
- [Troubleshooting](#troubleshooting)

## Project structure

Keep site content separate from framework packages. The site repository should own configuration, content, assets, and any local extensions; Cogita packages should be installed as dependencies.

```text
my-site/
├── cogita.config.ts
├── package.json
├── content/
│   ├── guides/
│   └── reference/
├── posts/
├── public/
├── components/
└── styles/
```

Use `contentDir` for handbook-style documents and `posts.dir` for article collections. A Knowledge site can expose both through one theme, while a Docs site normally uses `contentDir` as its primary source.

### Organize for the reader

Choose one primary information architecture and keep URLs stable:

- Use time-based folders for a journal or release archive.
- Use topic folders for a handbook or reference site.
- Use a shallow hybrid only when readers need both topic and time navigation.

Do not encode temporary workflow states into public URLs. Keep drafts in a dedicated folder or use frontmatter, then publish without changing the final route.

## Configuration

Start with the smallest useful configuration and add capabilities only when the site needs them.

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Northstar Handbook',
    description: 'A practical engineering handbook for product teams.',
    base: process.env.NODE_ENV === 'production' ? '/northstar/' : '/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
});
```

Keep responsibilities in their own namespaces:

- `site` contains branding, language, URL, and base path.
- `contentDir` and `posts` describe where content comes from.
- `theme` selects the rendering system.
- `themeConfig` contains navigation and theme-specific presentation.
- Plugin namespaces such as `rss`, `search`, and `comments` contain their own options.

### English-first interface copy

Use English as the default fallback so a new installation is usable before a message dictionary is complete. Add a second dictionary only when the site is ready to offer a real language choice.

```ts
export default defineConfig({
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'site.search': 'Search',
      },
      'zh-CN': {
        'site.search': '搜索',
      },
    },
  },
});
```

`@cogita/plugin-i18n` translates interface copy used by themes and plugins. It does not translate Markdown, article titles, or user metadata. Localized content should be authored as localized content and published through the site's content strategy.

## Content authoring

Write frontmatter for both readers and machines. Use a concise title, a useful description, and stable dates.

```yaml
---
title: "A concise, descriptive title"
description: "A short summary for search and social previews."
createDate: "2026-09-01"
updateDate: "2026-09-01"
tags:
  - "engineering"
  - "workflow"
categories:
  - "guides"
draft: false
featured: false
---
```

### Make a page scannable

- Use one `#` heading, followed by a meaningful `##` structure.
- Put the decision or outcome near the top of the page.
- Prefer short paragraphs and lists for operational guidance.
- Use code blocks for copyable commands and complete configuration snippets.
- Add descriptive alt text to every informative image.
- Link to the next relevant page instead of repeating the entire explanation.

Avoid headings that only describe a visual element. A heading should still make sense in the table of contents and in search results.

### Drafts and previews

Keep draft content out of production builds. Preview it locally with the same base path and theme that production uses, so broken links and asset paths are caught before publishing.

```bash
pnpm run dev
pnpm run build
pnpm run preview
```

## Themes and plugins

Treat a theme as the site's rendering boundary and a plugin as a capability provider:

```text
site config → Core → theme → plugins → static output
```

Themes should declare the plugins and layouts they need. Plugins should validate their own namespace, return `null` when not configured, and expose build data through stable virtual modules.

### Choose the right theme

| Site shape | Recommended theme | Primary strength |
| --- | --- | --- |
| Product handbook or API reference | `@cogita/theme-docs` | Navigation, sidebars, and focused reading |
| Personal blog or content archive | `@cogita/theme-lucid` | Lightweight publishing and archives |
| Editorial technical site | `@cogita/theme-editorial` | Reading rhythm and featured writing |
| Wiki, research notes, or mixed sources | `@cogita/theme-knowledge` | Search, topics, and backlinks |

If a feature is useful to more than one theme, make it a plugin. If it changes page composition, make it a theme extension. Keep site-specific business rules in the site repository.

### Extend without forking Core

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-knowledge',
  themeConfig: {
    knowledge: {
      title: 'Atlas of Practice',
    },
  },
});
```

Use the public types from `@cogita/shared` for custom plugins and layouts. Avoid importing internal files from another package; internal imports make upgrades harder and can break an otherwise valid consumer.

## Performance and deployment

The most valuable performance work for a static site is usually reducing unnecessary work and keeping the generated output cacheable.

### Build efficiently

- Keep content sources independent so a theme can consume only the data it needs.
- Prefer the shared content index when multiple plugins need the same metadata.
- Read full document bodies only for features that need full text.
- Keep image dimensions and alt text in metadata when possible.
- Use the package build before consumer builds so workspace dependencies resolve to current output.

```bash
pnpm run build:packages
pnpm --filter docs-site build
pnpm run check:pages-artifact
```

### Deploy safely

For GitHub Pages, the workflow should build the docs site, validate the staged artifact, and publish the generated directory. The important checks are:

1. The configured base path matches the Pages project path.
2. Every navigation link resolves to a generated page.
3. CSS, JavaScript, images, and social cards use the same asset prefix.
4. The generated output contains the intended English entry points and demos.

For a custom host, use `/` as the production base. For a project Pages site, use the repository path consistently in `site.base` and `builderConfig.output.assetPrefix`.

## SEO and accessibility

Use `site.title`, `site.description`, and page frontmatter as separate layers:

- The site description explains the product or collection.
- A page description explains one page and should not be copied everywhere.
- A social image should remain readable when shown as a small card.

Use semantic headings, visible focus states, keyboard-operable controls, and labels for search and language controls. Do not use color alone to communicate state.

## Troubleshooting

### A page is blank or falls back to client rendering

Check the build output for the first SSG error. A global UI component must be safe to execute in Node during static rendering and must include any runtime imports required by its compiled output.

### A theme or plugin cannot be resolved

Rebuild workspace packages, then verify the package name and the selected theme's declared dependencies.

```bash
pnpm install
pnpm run build:packages
```

### Assets work locally but fail on Pages

Inspect the generated HTML and confirm that links include the configured base path. Use `pnpm run check:pages-artifact` before pushing a deployment change.

### Interface copy is in the wrong language

Confirm that the site has an `i18n` dictionary for the requested locale, that the fallback text in the theme is English, and that the browser language switcher is visible only when at least two locales are configured. Remember that this does not change Markdown content.

### A plugin appears to do nothing

Check its configuration namespace and whether the selected theme consumes the plugin's layout or virtual module. A correctly designed optional plugin should remain silent when its capability is not configured.
