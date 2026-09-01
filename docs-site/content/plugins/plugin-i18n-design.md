---
title: i18n plugin
---

# i18n plugin

`@cogita/plugin-i18n` provides a small, theme-neutral contract for interface copy. It keeps translations out of Core and lets official and third-party themes consume the same runtime module.

## Configure a site

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-knowledge',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'knowledge.home.search': 'Search knowledge',
      },
    },
  },
});
~~~

The plugin resolves an exact locale first, then its language prefix, and finally the configured fallback locale. Missing keys use the fallback passed by the theme, so a site remains usable when a translation is incomplete.

## Theme contract

Themes import `t` from `virtual-cogita-i18n-text` and use stable namespaced keys such as `knowledge.home.search` or `lucid.search.title`. The fallback text should be English so a new site is English-first without a message file.

Rspress already owns `virtual-i18n-text`; Cogita deliberately uses its own namespaced module to avoid runtime-module collisions.

## Design boundary

The plugin translates interface copy only. Article titles, Markdown, and user-provided metadata remain content and are not rewritten. A future content-localization workflow can build on this contract without changing theme runtime behavior.
