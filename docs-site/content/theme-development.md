---
title: Theme development guide
---

# Theme development guide

A theme package owns page layouts, theme styles, and theme-level plugin declarations. It should not reimplement business logic such as post scanning, comments, or search inside layout components.

## Theme package structure

~~~text
themes/my-theme/
├── package.json
└── src/
    ├── index.ts
    ├── layouts/
    │   └── Home.tsx
    └── theme.css
~~~

## Export the theme configuration

~~~ts
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-my-theme',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    plugins: [],
  };
}
~~~

A theme package only declares capabilities. Plugin factories validate their own configuration, while themes declare the plugins they need through `plugins`. Core validates the theme home layout and plugin layout contracts.

## Publish and consume

A theme package should have its own `package.json`, build configuration, and version. Consumer projects install the package directly and reference its package name. Core does not bind to a specific theme, so the ecosystem can grow without continuously changing the framework core.

To start from a runnable skeleton, copy the [theme starter](https://github.com/wu9o/cogita/tree/main/starters/theme). It includes `pageLayouts.home`, a React layout, global styles, and an independent package build configuration.

## Verify a theme

~~~bash
pnpm --filter @cogita/theme-my-theme build
pnpm run build:packages
pnpm exec cogita build
~~~

See the [API reference](./api/api-reference.md) and [plugin API specification](./plugins/plugin-api-specification.md) for the complete contracts.