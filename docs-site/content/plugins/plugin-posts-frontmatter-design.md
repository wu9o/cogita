---
title: Posts Frontmatter plugin design
---

# Posts Frontmatter plugin design

`@cogita/plugin-posts-frontmatter` is the foundational content plugin for a blog site. It scans the posts directory, parses Markdown frontmatter, computes post routes, and exposes post data through `virtual-posts-data` for themes and other plugins.

## Data flow

```text
File system → frontmatter parsing → content index → route generation → virtual-posts-data
```

Blog lists, tags, RSS, search, and SEO consumers read this data through the shared `ContentIndex`; they should not scan the same directory again.

## Post data

```ts
export interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  url: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  [key: string]: unknown;
}
```

The plugin supports `.md` and `.mdx`, walks nested directories, and provides sensible fallbacks for missing titles or dates. An absolute `filePath` is build-time data; runtime themes should consume only safe public fields.

## Route rules

With a `posts` directory and the `posts` route prefix:

```text
posts/hello-world.md          → /posts/hello-world
posts/2026/notes/index.md     → /posts/2026/notes
posts/guides/setup.mdx        → /posts/guides/setup
```

Route calculation belongs to the shared utility boundary so RSS, search, and image consumers cannot produce different URLs for the same post.

## Usage

A theme can declare the plugin, so most site authors only need to select the theme:

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-lucid',
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
  },
});
```

Custom consumers read the runtime module:

```ts
import { allPosts } from 'virtual-posts-data';

const recentPosts = allPosts.slice(0, 5);
```

## Lifecycle and boundary

The plugin prepares the index in `beforeBuild`, creates post pages in `addPages`, and publishes post data in `addRuntimeModules`. Core invalidates the index before a development rebuild so new and edited posts enter the next build.

The plugin owns post discovery and metadata. It does not own tag filters, pagination, archives, RSS, or theme layouts. It should also expose empty runtime data when a site has no posts, preserving the zero-configuration experience.

## Compatibility

The post virtual module exposes `contentDataVersion`. A theme or plugin should check the version before consuming the data and emit a diagnostic or degrade when it is incompatible. See the [content index design](../api/content-index-design.html) and [plugin API specification](./plugin-api-specification.html) for shared capability and contract-version rules.

See the [Chinese version](../zh-CN/plugins/plugin-posts-frontmatter-design.html) for the same design in Chinese.
