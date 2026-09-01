---
title: Third-party extension starters
---

# Third-party extension starters

When a capability should be reused across multiple sites, copy an independent package from one of the repository starters:

- [Plugin starter](https://github.com/wu9o/cogita/tree/main/starters/plugin): includes `CogitaPluginFactory`, build context, unified logging, and capability declarations.
- [Theme starter](https://github.com/wu9o/cogita/tree/main/starters/theme): includes `CogitaTheme`, the required home layout, and global styles.

## Verify a copied package

After copying a starter, replace the `@your-scope` placeholder package name, install dependencies, and build:

~~~bash
pnpm install
pnpm run build
~~~

Register plugins through the site's `plugins` array and consume themes by package name. Release checks copy both starters into a temporary directory and run real package builds to ensure the templates do not depend on internal workspace paths.

## Extend from here

When a plugin needs configuration, prefer a factory closure that receives options and returns `null` when the configuration is not satisfied. When it needs a page, declare `requiredLayouts` in plugin metadata and provide the matching `pageLayouts` in the theme. Add a versioned virtual module only when browser data is required, and cover independent consumers with a build or browser acceptance check.