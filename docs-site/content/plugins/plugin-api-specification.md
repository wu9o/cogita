# Plugin API specification

This page defines the public contract for registering Cogita plugins, validating their configuration, and sharing build-time capabilities. It is the boundary used by built-in, theme, site, and community plugins.

## 1. Plugin factories

A plugin exports a factory that receives the enhanced `CogitaPluginConfig`:

```typescript
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginExample: CogitaPluginFactory = (config) => {
  if (config.example?.enabled === false) return null;

  return {
    name: '@cogita/plugin-example',
    beforeBuild() {},
  };
};
```

A factory may return one Rspress plugin, an array, or `null` / `undefined`. Disabled capabilities should return `null`. Core and themes should not duplicate a plugin's configuration checks.

## 2. Registration and ordering

Themes declare default capabilities through `CogitaTheme.plugins`. A site adds project-specific capabilities through `CogitaConfig.plugins`:

```typescript
import { defineConfig } from '@cogita/core';
import { pluginExample } from './plugins/example';

export default defineConfig({
  theme: '@cogita/theme-lucid',
  plugins: [pluginExample],
});
```

The final source order is `core plugins → theme bridge plugins → theme plugins → site plugins`. It resolves identity, source, and conflicts; it is not a serial lifecycle dependency. Rspress may invoke hooks concurrently, so plugins should coordinate through the shared `contentIndex` or virtual modules.

Every plugin must have a non-empty `name`. Strict mode stops on invalid results and factory errors while preserving the original error as `cause`. Non-strict mode logs a warning and skips the invalid plugin.

The theme's `home` layout is required. Plugins that create pages declare their layout needs:

```typescript
export const pluginExample: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-example',
  cogita: {
    requiredLayouts: [
      { layout: 'example', label: 'Example page' },
      {
        layout: 'example-detail',
        label: 'Example detail page',
        when: (config) => config.example?.detailEnabled === true,
      },
    ],
  },
});
```

`requiredLayouts.layout` matches a key in the theme's `pageLayouts`. `when` makes a requirement conditional. Core validates all requirements after plugin instantiation, before a site can publish a broken route.

## 3. Capability contracts

Layout contracts answer whether a page exists. Capability contracts describe the data a theme or plugin needs. Identifiers use stable `domain.capability` strings such as `content.posts`.

Plugins declare `providesCapabilities` and `requiresCapabilities`. Themes use `capabilities.required` for hard dependencies and `capabilities.optional` for features that can degrade gracefully. Built-in identifiers come from `COGITA_CAPABILITIES` in `@cogita/shared`.

```typescript
import { COGITA_CAPABILITIES } from '@cogita/shared';

export const pluginPosts: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-posts-frontmatter',
  cogita: {
    providesCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
  },
});

export const themeExample = {
  name: '@cogita/theme-example',
  capabilities: {
    required: [COGITA_CAPABILITIES.CONTENT_POSTS],
    optional: [COGITA_CAPABILITIES.CONTENT_IMAGES],
  },
  pageLayouts: { home: './layouts/Home.js' },
};
```

Core validates dependencies after all plugins are instantiated. Strict mode fails on a missing capability; `strict: false` emits a warning. A capability should have one provider. Multiple providers produce `COGITA_CAPABILITY_PROVIDER_CONFLICT`.

| Capability | Provider | Typical consumers |
| --- | --- | --- |
| `content.posts` | Posts Frontmatter | Tags, collections, categories, search, post lists |
| `content.relations` | Content Relations | Related content, outbound links, backlinks |
| `content.images` | Images | Theme covers and image inventories |
| `content.collections` | Collections | Collection navigation |
| `discovery.tags` | Tags | Tag navigation |
| `discovery.categories` | Categories | Category navigation |
| `discovery.search` | Search | Search pages |
| `content.blog-list` | Blog List | Archives and post lists |
| `engagement.comments` | Comments | Article comment areas |
| `ui.code-copy` | Code Copy | Code block copy buttons |
| `ui.reading-progress` | Reading Progress | Reading progress and reading time |
| `syndication.rss` | RSS | RSS, Atom, and JSON Feed |
| `seo.metadata` / `seo.sitemap` | SEO / Sitemap | Search metadata and sitemaps |

## 4. Runtime modules

`addRuntimeModules` passes build-time data to theme layouts. A module identifier must be unique in one build; a conflict fails in strict mode.

Core may provide safe empty modules for optional capabilities. A fallback is marked with `runtimeModulePolicy: 'fallback'` and can be replaced by a real provider:

```typescript
const fallbackPlugin: CogitaPlugin = {
  name: '@cogita/plugin-example-defaults',
  cogita: { runtimeModulePolicy: 'fallback' },
  addRuntimeModules() {
    return { 'virtual-example-data': 'export const items = [];' };
  },
};
```

Fallback modules may expose empty data or disabled state, but never absolute paths, tokens, or article bodies. Real providers keep the same module identifier and documented data shape.

## 5. Identity and diagnostics

The plugin instance `name` is its global identity and must be unique. `strict` defaults to `true`; duplicate names stop the build. With `strict: false`, Core keeps the first registration and warns through the shared logger.

Strict Core errors expose a stable `diagnostic` field. Tooling should branch on the code instead of parsing localized error text. The current `schemaVersion` is `1`.

```typescript
import { getCogitaDiagnostic } from '@cogita/shared';

try {
  await buildSite();
} catch (error) {
  const diagnostic = getCogitaDiagnostic(error);
  if (diagnostic?.code === 'COGITA_CAPABILITY_MISSING') {
    console.error('Install or register a provider for the missing capability.');
  }
  throw error;
}
```

Important diagnostic codes include:

| Code | Scenario |
| --- | --- |
| `COGITA_THEME_LAYOUT_MISSING` | A required theme layout is missing |
| `COGITA_CAPABILITY_MISSING` | A dependency has no provider |
| `COGITA_CAPABILITY_PROVIDER_CONFLICT` | Multiple plugins provide one capability |
| `COGITA_PLUGIN_INVALID` | A factory returned an invalid plugin |
| `COGITA_PLUGIN_DUPLICATE` | A plugin name was registered twice |
| `COGITA_PLUGIN_FACTORY_FAILED` | A plugin factory threw |
| `COGITA_PAGE_ROUTE_CONFLICT` | A page route was registered twice |
| `COGITA_RUNTIME_MODULE_CONFLICT` | A virtual module was registered twice |
| `COGITA_THEME_LOAD_FAILED` | A theme could not be resolved |
| `COGITA_CONTENT_DIR_NOT_FOUND` | `contentDir` does not exist |

## 6. Build context and lifecycle

Use the shared helpers for build-time services:

```typescript
import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';

const pluginExample: CogitaPluginFactory = (config) => {
  const context = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);

  return {
    name: '@cogita/plugin-example',
    async beforeBuild() {
      logger.info('Building site at ' + context.root);
      const posts = await context.contentIndex?.getPosts();
      logger.debug('Indexed posts: ' + (posts?.length ?? 0));
    },
  };
};
```

`CogitaBuildContext` includes `root` / `cwd`, the shared `contentIndex`, absolute `themeLayouts`, `strict`, the unified `logger`, and framework metadata. Legacy top-level fields remain for compatibility; new build-time services belong in this context.

Use lifecycle hooks for one responsibility:

- `beforeBuild`: read the content index, prepare files, and validate configuration.
- `addPages`: generate additional pages without rescanning articles.
- `addRuntimeModules`: expose serialized build data to browser code.
- `afterBuild`: write reports or artifacts; do not rewrite generated pages.

Core attaches `contractVersion` to `buildContext` and `contentIndex`. Virtual modules export `cogitaVirtualModuleVersion`. Import `COGITA_VIRTUAL_MODULE_IDS`, `COGITA_CAPABILITIES`, and `createCogitaVirtualModule` from `@cogita/shared` instead of hard-coding public identifiers.

## 7. Testing requirements

At minimum, test:

- missing configuration and `enabled: false` returning `null`;
- build context access to the site root and shared content index;
- strict duplicate-name failure and non-strict first-registration behavior;
- lifecycle hooks, page generation, and runtime module output in a minimal site.
