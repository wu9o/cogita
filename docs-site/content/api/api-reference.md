# API reference

This page is the public API map for Cogita. It focuses on the contracts that site authors, theme authors, and plugin authors need when building a portable site. The [Chinese version](../zh-CN/api/api-reference.html) keeps the same entry points in Chinese.

## Core API

### `@cogita/core`

#### `defineConfig(config: CogitaConfig): CogitaConfig`

Defines a type-safe Cogita configuration. It returns the same object so TypeScript and IDE tooling can validate the site configuration.

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Documentation',
    description: 'A project usage manual',
  },
  theme: '@cogita/theme-docs',
});
```

#### `loadCogitaConfig(root?: string): Promise<CogitaConfig>`

Loads `cogita.config.ts`, `cogita.config.js`, or `cogita.config.mjs` from a project root. When `root` is omitted, Core uses `process.cwd()`.

#### `createRspressConfig(cogitaConfig: CogitaConfig, root: string): Promise<UserConfig>`

Converts Cogita configuration into Rspress configuration. The process resolves the theme, instantiates declared theme plugins, and merges the resulting configuration.

## Configuration contracts

```ts
interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;
  contentDir?: string;
  contentSources?: readonly ContentSource[];
  plugins?: CogitaPluginFactory[];
  themeConfig?: ThemeConfig;
  builderConfig?: BuilderConfig;
  locales?: readonly SiteLocale[];
  languageParity?: LanguageParityConfig;
}
```

Use `contentDir` for ordinary Markdown documents. Use `contentSources` to connect Git, an API, or another knowledge base; Core places those entries in the shared `ContentIndex`. An external entry with `getContent` can also become a static page.

### `SiteConfig`

```ts
interface SiteConfig {
  title?: string;
  description?: string;
  lang?: string;
  icon?: string;
  base?: string;
}
```

### `ContentSource`

A content source needs a site-unique `id` and a `load` function. Each entry should provide `kind`, `title`, `filePath`, `route`, and `updateDate`. Implement `getContent` when full-text search, content relations, or a generated content page should consume the source.

```ts
import type { ContentSource } from '@cogita/core';

const notes: ContentSource = {
  id: 'notes',
  async load() {
    return [{
      kind: 'document',
      title: 'Remote notes',
      filePath: 'source://notes/remote-note',
      route: '/notes/remote-note',
      updateDate: '2026-08-25T00:00:00.000Z',
    }];
  },
  async getContent(entry) {
    return `# ${entry.title}\n\nContent loaded from an external knowledge base.`;
  },
};
```

### Theme and builder configuration

`ThemeConfig` and `BuilderConfig` pass through to Rspress `themeConfig` and `builderConfig`. Declare site-level locale routes with `locales`; use `languageParity` to define the fallback behavior when a translation is missing.

## Theme API

```ts
interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
  };
  globalStyles?: string[];
  plugins?: CogitaPluginFactory[];
}
```

A theme owns layouts and visual boundaries and declares its required capabilities through `plugins`. Configuration validation and content scanning belong to Core or plugins, not to layout components.

```ts
export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-lucid',
    pageLayouts: { home: './layouts/Home.js' },
    plugins: [pluginPostsFrontmatter, pluginTags],
  };
}
```

Layout components use `LayoutProps`, which carries `routePath`, the Rspress `config`, page data, and optional `children`.

## Plugin API

```ts
type CogitaPluginFactory = (
  config: CogitaPluginConfig,
) => RspressPlugin | RspressPlugin[] | null | undefined;
```

A factory receives the Core-enhanced configuration. A plugin validates its own options and returns `null` when disabled, so invalid or unused capabilities are not registered with Rspress.

```ts
export const pluginExample: CogitaPluginFactory = (config) => {
  if (!config.example?.enabled) return null;

  return {
    name: '@cogita/plugin-example',
    async beforeBuild() {},
  };
};
```

Common lifecycle hooks are `beforeBuild`, `afterBuild`, `addPages`, `addRuntimeModules`, and `config`. An additional page is described by `routePath`, Markdown `content`, and a component `filepath`. Register site-specific plugins in the `plugins` array of `cogita.config.ts`.

Read framework-owned build state through `getCogitaBuildContext(config)`. It includes `root`, `cwd`, `contentIndex`, the theme layout path, and build metadata. The full registration, capability, and version rules are in the [plugin API specification](../plugins/plugin-api-specification.html).

## Content index and shared types

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
  getEntries?(): Promise<readonly ContentEntry[]>;
  getPostContent?(filePath: string): Promise<string>;
  invalidate?(): void;
}
```

Core creates a lazy index so multiple plugins share one scan. `getEntries` covers posts, `contentDir` documents, and external content sources; full text is read and cached on demand. See the [content index design](./content-index-design.html) for source boundaries and contract versions.

Post references use `ContentPostReference` from `@cogita/shared`. A theme that only renders a post list should consume the plugin runtime module instead of scanning the filesystem again.

## Virtual modules

### `virtual-posts-data`

The post plugin provides post data and `contentDataVersion`:

```ts
declare module 'virtual-posts-data' {
  export const contentDataVersion: 1;
  export const allPosts: PostFrontmatter[];
}
```

### `virtual-content-relations-data`

The content-relations plugin provides outgoing links, backlinks, and related-content queries:

```ts
declare module 'virtual-content-relations-data' {
  export const cogitaVirtualModuleVersion: 1;
  export function getBacklinks(route: string): ContentRelationLink[];
  export function getOutgoingLinks(route: string): ContentRelationLink[];
  export function getRelatedContent(route: string, limit?: number): ContentRelationLink[];
}
```

Plugins should take module IDs from `COGITA_VIRTUAL_MODULE_IDS` and add the shared version header with `createCogitaVirtualModule(source)`. A theme should explicitly degrade or emit a diagnostic when a consumed module is incompatible.

## Lifecycle and diagnostics

After configuration loading, theme resolution, and plugin creation, Core runs `beforeBuild`, `addPages`, and `addRuntimeModules`, hands the result to Rspress, and then runs `afterBuild`. The development server reloads configuration and rebuilds plugin data when relevant inputs change.

The CLI converts missing configuration, load failures, and theme-resolution failures into stable diagnostics such as `COGITA_CONFIG_NOT_FOUND`. Plugins should report configuration errors clearly and gracefully degrade when optional capabilities are not configured.

## Related resources

- [Plugin API specification](../plugins/plugin-api-specification.html)
- [Plugin development guide](../plugins/plugin-development.html)
- [Theme development guide](../theme-development.html)
- [Content index design](./content-index-design.html)
