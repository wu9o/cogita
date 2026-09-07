# Content index design

## Why a shared index exists

Article frontmatter is a shared input for many Cogita plugins. Previously, `posts-frontmatter`, blog lists, tags, categories, collections, search, RSS, SEO, and the sitemap each scanned the article directory and parsed frontmatter independently. As a site grows, that creates repeated I/O, repeated parsing, and inconsistent plugin data.

## The build-time model

Before creating theme plugins, Core injects a lazy `ContentIndex` into each build:

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
  getEntries?(): Promise<readonly ContentEntry[]>;
  getPostContent?(filePath: string): Promise<string>;
  invalidate?(): void;
}
```

The first plugin that calls `getEntries()` or `getPosts()` performs the scan. Later consumers share the same Promise. `getEntries()` includes posts, ordinary `contentDir` documents, and explicitly registered content-source entries. `getPosts()` retains its legacy post-only behavior while also including content-source entries declared as `post`. Full text is read lazily through `getPostContent(filePath)` and cached, so search and RSS do not reread the same file independently.

Before build-time hooks run again, Core calls `invalidate()`. The next build then rereads posts, documents, and content sources. `getEntries()` and the content reader remain optional so third-party `ContentIndex` implementations stay compatible. The native index uses the same post route rules as `posts-frontmatter` and generates ordinary document routes from `contentDir`.

### External content sources

A site can explicitly register an external source through `contentSources`. An adapter only converts external data into the shared `ContentSourceEntry` shape; it does not depend on a theme or mutate `ContentIndex` directly. Core fills in `sourceId` and a default `url`:

```ts
import type { ContentSource } from '@cogita/core';

const researchNotes: ContentSource = {
  id: 'research-notes',
  async load() {
    return [
      {
        kind: 'document',
        title: 'Remote notes',
        filePath: 'source://research-notes/remote-note',
        route: '/notes/remote-note',
        updateDate: '2026-08-25T00:00:00.000Z',
      },
    ];
  },
  async getContent(entry) {
    return `# ${entry.title}\n\nContent loaded from an external knowledge source.`;
  },
};

export default defineConfig({
  contentSources: [researchNotes],
});
```

If an external source publishes images or other static files with its content, it can implement `getAssets(context)` and return `{ filePath, publicPath }` descriptors. Core copies those assets before development preview and production builds. The adapter rewrites relative Markdown references to public paths; a checked-out external directory should not be mounted directly at the site root.

`id` must be unique within a site. `filePath` is the stable identity of an entry and does not have to be a local file path. To make external full-text search and content relations work, an adapter must implement `getContent`. Without a content reader, metadata, tags, and search results can still consume the entry, while full-text search and relation extraction gracefully degrade. A source route must not collide with `posts`, `contentDir`, or another source, so one URL never maps to multiple content entities. Once `getContent` is implemented, Core renders the returned Markdown as an additional static page. Git checkouts and JSON snapshots can therefore have real content entry points instead of appearing only in a search index.

Plugin factories also receive `buildContext`. It contains framework-owned state such as `root`, `cwd`, `contentIndex`, the theme layout path, and build metadata. Older plugins can still read the equivalent top-level fields; new plugins should call `getCogitaBuildContext(config)` instead of continuing to expand the internal configuration object.

The following consumers have been migrated:

- `plugin-posts-frontmatter` uses the index first to generate `virtual-posts-data`.
- `plugin-blog-list` uses the index first for lists, filters, pagination, and archives.
- `plugin-tags`, `plugin-categories`, and `plugin-collections` derive aggregation data from the index first.

Aggregation plugins share `ContentPostReference` from `@cogita/shared` instead of duplicating post-reference fields. Plugins that need post capabilities consume the `ContentIndex` injected by Core rather than depending directly on the post scanning package. The `virtual-posts-data` runtime module also exposes `contentDataVersion`, allowing an external theme to reject an incompatible data contract explicitly.

## Content relations

`@cogita/plugin-content-relations` is the first knowledge-base plugin built on the shared index. It reads post content on demand, extracts internal Markdown links, and exposes outgoing links, backlinks, and related-content queries through `virtual-content-relations-data`. It consumes only `ContentIndex`; it does not rescan the article directory or depend on a particular theme layout.

```ts
import {
  getBacklinks,
  getRelatedContent,
} from 'virtual-content-relations-data';

const backlinks = getBacklinks('/posts/current');
const related = getRelatedContent('/posts/current');
```

The current index covers posts, ordinary `contentDir` documents, and explicitly registered content-source entries. The Knowledge theme combines search, tags, relations, and document navigation; external entries with content are also rendered as static pages by Core. Third-party adapters should continue to extend the stable entry metadata, content reader, and source-version strategy rather than reaching into theme implementation details.

## Public contract versions

`@cogita/shared` exposes the following stable version fields. Increment the relevant version when adding an incompatible field:

| Contract | Version field | Purpose |
| --- | --- | --- |
| Build context | `COGITA_BUILD_CONTEXT_VERSION` / `buildContext.contractVersion` | Identifies the shape of `CogitaBuildContext` |
| Content index | `COGITA_CONTENT_INDEX_VERSION` / `contentIndex.contractVersion` | Identifies `ContentIndex` methods and data model |
| Virtual modules | `COGITA_VIRTUAL_MODULE_SCHEMA_VERSION` / `cogitaVirtualModuleVersion` | Identifies the common header for Cogita runtime modules |
| Content data | `COGITA_CONTENT_DATA_VERSION` / `contentDataVersion` | Preserves `virtual-posts-data` compatibility |

Virtual module IDs come from `COGITA_VIRTUAL_MODULE_IDS`, and the built-in post capability is `COGITA_CAPABILITIES.CONTENT_POSTS`. Third-party plugins may declare their own capability identifiers, but must not redefine `content.posts` or reuse an existing virtual module ID. A plugin should use `createCogitaVirtualModule(source)` to add the version header:

```typescript
import {
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
} from '@cogita/shared';

return {
  [COGITA_VIRTUAL_MODULE_IDS.SEARCH_DATA]: createCogitaVirtualModule(`
    export const searchDocuments = ${JSON.stringify(documents)};
  `),
};
```

`contractVersion` remains optional for third-party compatibility implementations so older plugins can continue to work; Core-native implementations always provide it. A third-party theme consuming a module should explicitly degrade or emit a diagnostic when the version is incompatible instead of silently rendering with stale fields.

- `plugin-search` uses the index first for search metadata and reads full text only when full-text indexing is explicitly enabled.
- `plugin-rss`, `plugin-seo`, and `plugin-sitemap` use the index first for feeds, page metadata, and sitemap data.
- `plugin-images` uses post cover fields from the index to associate public images.
- `plugin-reading-progress` and `plugin-comments` use post routes and file paths from the index.

Built-in plugins that depend on `content.posts` no longer retain independent scanning paths. Core guarantees the index during capability validation; in non-strict mode, a missing index produces a warning and empty-data fallback. This prevents an external site from installing multiple post parsers and prevents different plugins from producing different representations of the same post. Third-party plugins can still provide their own `ContentIndex` adapter during migration.

## Boundaries

- `ContentIndex` belongs to build-time plugin configuration and never enters browser runtime state.
- `buildContext` is build-time context and must not be serialized into runtime virtual modules.
- Shared types belong in `@cogita/shared`; Core must not depend on business plugins, avoiding reverse coupling.
- The index discovers and parses content metadata; it does not own tag filtering, pagination, archives, or page generation.
- Each plugin remains responsible for its own configuration validation, data transformation, and virtual-module output.

## Completed architecture work

1. ✅ The development server watches article directories, public assets, and the Cogita config. On changes it closes the old Rspress instance, reloads configuration, and reruns plugin factories, `beforeBuild`, `addPages`, and `addRuntimeModules`. New posts, filter routes, and aggregation data can therefore update together. Ordinary body edits can still use Rspress HMR; a full rebuild is limited to inputs that require new Cogita page data.
2. ✅ Built-in full-text consumers reuse `getPostContent`, with summary fallback retained for third-party indexes.
3. ✅ Built-in post-capability consumers no longer directly depend on `plugin-posts-frontmatter`; release validation only needs to keep checking independent consumer builds.
4. ✅ The content-relations plugin reuses the shared index and exposes the stable `content.relations` capability and `virtual-content-relations-data` module.

With the migration complete, themes still declare the post plugin, while content consumers depend only on the shared capability contract. A standalone plugin that needs legacy Core compatibility should provide its own adapter instead of bringing the old post parser back into the core plugin package.
