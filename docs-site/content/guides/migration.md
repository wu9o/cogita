---
title: Split site content from the framework repository
---

# Split site content from the framework repository

The Cogita framework repository maintains Core, plugins, themes, and the handbook example. Personal blogs, team knowledge bases, and product documentation should be independent consumer sites that install and use those packages.

## Why split the repositories

Keeping real blog posts in the framework repository couples two different lifecycles:

- framework upgrades become mixed with content changes;
- the handbook can only demonstrate the framework through real-blog pages;
- comments, images, and article assets become tied to framework history and permissions.

After the split, the framework repository publishes packages and its handbook, while the content repository owns articles, site configuration, and deployment.

## Minimal consumer structure

```text
my-site/
├── content/             # Markdown documents
├── posts/               # Article collection when the posts plugin is used
├── public/              # Static assets
├── cogita.config.ts
└── package.json
```

A docs site uses `contentDir`; a blog uses `posts` and its theme plugins. The two content models can be selected independently and do not need to share a repository.

## Install framework packages

Declare published packages directly in the consumer site:

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-lucid
```

For a documentation-only site, use the docs theme:

```bash
pnpm add -D @cogita/theme-docs
```

The consumer installs its own themes and plugins. Core does not implicitly bind a theme from the framework monorepo.

## Configuration examples

### Documentation site

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Project handbook',
    description: 'Configuration and API documentation for developers.',
    base: '/my-site/',
    url: 'https://example.github.io/my-site/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
});
```

### Blog site

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My blog',
    description: 'Technical notes and ideas.',
    base: '/',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
  },
  theme: '@cogita/theme-lucid',
});
```

## Migration steps

1. Copy articles, images, and comment configuration to the independent repository.
2. Replace `workspace:*` dependencies with published Cogita packages.
3. Choose `contentDir` or `posts` according to the site type.
4. Update `site.base`, `site.url`, and comment mappings for the new repository.
5. Configure GitHub Pages or another static host in the new repository.
6. Build and check every page, asset, feed, and comment entry before retiring the old path.

## Version strategy

The framework repository uses Changesets for package releases. A consumer site only needs a compatible set of versions in its own `package.json`:

```json
{
  "devDependencies": {
    "@cogita/cli": "^0.1.19",
    "@cogita/core": "^0.12.3",
    "@cogita/theme-lucid": "^0.11.2"
  }
}
```

When upgrading, read each package changelog first, then update the CLI, Core, theme, and site plugins as one tested set. Avoid upgrading only one side of a shared contract.

## Acceptance checklist

- The independent repository installs and builds without the Cogita source tree.
- CSS, JavaScript, images, and internal links load under the production path.
- Comment and article repositories no longer point at the framework repository.
- The handbook does not depend on personal blog posts as its examples.

The framework repository also provides an independent blog consumer check. It copies the blog configuration, posts, and public assets into a temporary directory, replaces published dependencies with the current tarballs, and checks the home page, post pages, images, feeds, and sitemap:

```bash
COGITA_BLOG_DIR=/path/to/cogita-blog pnpm run check:external-blog
```

This does not modify the blog repository or require it to join the Cogita monorepo.

The handbook provides a similar independent docs consumer check. It installs the current packages into a temporary docs site and checks the docs theme, content directory, and representative routes:

```bash
pnpm run check:docs-consumer
```

This check does not modify `docs-site`; it ensures the handbook does not depend on a blog `posts` directory or hide routing problems behind workspace links.
