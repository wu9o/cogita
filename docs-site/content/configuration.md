---
title: Configuration
---

# Configuration

Cogita keeps site-level decisions in `cogita.config.ts`. Themes own the presentation boundary; plugins own data and build capabilities.

## Minimal configuration

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My site',
    description: 'A clear description for visitors and search engines.',
  },
  theme: '@cogita/theme-lucid',
});
~~~

## English-first interface

All official themes support `@cogita/plugin-i18n`. The default interface fallback is English, and a site can provide translated messages when needed:

~~~ts
export default defineConfig({
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'lucid.home.search': 'Search articles',
      },
    },
  },
});
~~~

Theme UI calls the shared `virtual-cogita-i18n-text` module. The namespace is intentionally different from Rspress's own `virtual-i18n-text` module.

## Configuration boundaries

- `site` describes the public site and deployment base.
- `theme` selects the presentation and its declared plugin ecosystem.
- `themeConfig` contains theme-specific layout choices.
- Plugin namespaces such as `posts`, `search`, `rss`, and `i18n` configure individual capabilities.

## Build

~~~bash
pnpm exec cogita build
~~~

Use `pnpm exec cogita doctor --strict --json` before deployment to check package resolution, configuration, theme contracts, content directories, and build entrypoints.
