---
title: Development guide
---

# Development guide

This guide is for contributors to the Cogita framework, themes, and plugins. It covers local development, quality checks, testing, and release validation.

## Initialize a site

Use the CLI to create a minimal blog, docs, or knowledge site:

```bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
pnpm dlx @cogita/cli create my-knowledge --template knowledge
```

The blog template reads `posts/`, the docs template reads Markdown pages from `content/`, and the Knowledge template reads both content types. Run `pnpm run dev` after generation.

## Development environment

Requirements:

- Node.js `>= 18`
- pnpm `>= 9`
- TypeScript `^5`

Install dependencies with:

```bash
pnpm install
```

Cogita uses pnpm workspaces. Internal dependencies use `workspace:*`. Do not replace pnpm with npm or yarn, because that can create an incompatible lockfile.

## Common commands

```bash
pnpm run build:packages
pnpm run build:docs
pnpm run dev
pnpm run preview
pnpm run preview:lucid
pnpm run demo
pnpm run check
pnpm run test
pnpm run check:release
```

After changing package source, run `pnpm run build:packages` before the docs site or tests. This prevents a site from consuming stale `dist` output.

`preview:lucid` reads the sibling `cogita-blog` repository by default. Set `COGITA_BLOG_DIR=/path/to/cogita-blog` to use another content repository. The command copies content and public assets to a temporary preview site, builds with the current workspace packages, and starts a root-path server. Production `site.base` should still match the deployed URL.

## Theme demos

The `demos/` directory contains four independent Cogita consumer projects, not a mirror of an existing blog. Each project has its own `package.json`, `cogita.config.ts`, and custom Markdown content:

| Demo | Theme | Content focus |
| --- | --- | --- |
| `demos/docs` | `@cogita/theme-docs` | Northstar engineering handbook |
| `demos/lucid` | `@cogita/theme-lucid` | Field Notes practice journal |
| `demos/editorial` | `@cogita/theme-editorial` | Small Systems Review |
| `demos/knowledge` | `@cogita/theme-knowledge` | Atlas of Practice knowledge base |

Run `pnpm run demo` to build all four demos and serve the index at `http://localhost:3100/`. To develop one demo, run `pnpm --filter @cogita/demo-knowledge dev` and replace the package name as needed. Every new built-in theme should add a corresponding demo and index entry so contributors can verify its consumer configuration without relying on real blog content.

## Workspace structure

```text
packages/       # Core, CLI, Shared, and UI
plugins/        # Optional capabilities
themes/         # Complete theme packages
docs-site/      # Framework handbook example
scripts/        # Build and helper scripts
```

Personal blogs, product documentation, and other real content sites stay outside this repository and consume Cogita through published packages. This keeps framework code, handbook content, and site content on independent release boundaries.

## Add a plugin

Recommended structure:

```text
plugins/your-feature/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   └── utils.ts
├── tests/
├── client.d.ts
├── package.json
├── tsconfig.json
└── rslib.config.ts
```

Use the factory pattern:

```ts
import type { CogitaPluginConfig } from '@cogita/shared';

export function pluginYourFeature(config: CogitaPluginConfig) {
  if (!config.yourFeature) return null;

  return {
    name: '@cogita/plugin-your-feature',
    async beforeBuild() {
      // 在构建阶段处理文件或生成数据
    },
  };
}
```

A plugin should:

1. read options from its own configuration namespace;
2. return `null` when disabled or when a required capability is unavailable;
3. use `getCogitaBuildContext` for the shared index, layouts, and logger;
4. declare required layouts through `cogita.requiredLayouts`;
5. declare capability dependencies with `cogita.providesCapabilities` and `cogita.requiresCapabilities`;
6. expose build-time data through virtual modules;
7. test defaults, disabled configuration, missing capabilities, and invalid configuration.

## Add a theme

A theme combines page layouts, styles, and default plugin capabilities:

```text
themes/your-theme/
├── src/
│   ├── index.ts
│   ├── layouts/
│   ├── components/
│   └── theme.css
├── package.json
├── tsconfig.json
└── rslib.config.ts
```

The entry point should declare layouts and plugins:

```ts
import path from 'node:path';
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-your-theme',
    pageLayouts: { home: './layouts/Home.js' },
    globalStyles: [path.resolve(__dirname, './theme.css')],
    plugins: [],
  };
}
```

Do not validate plugin options inside a theme or hard-code a site's content into a layout. Let plugins declare page requirements and let the theme implement the corresponding `pageLayouts` keys.

## Code quality

The project uses Biome rather than ESLint or Prettier:

```bash
pnpm run check
pnpm run check:fix
```

Keep code comments, JSDoc, TODOs, and FIXMEs in Chinese. Use strict TypeScript and avoid `any` outside a deliberate boundary. Use Conventional Commits, for example:

```text
feat(plugin): add image metadata support
fix(core): validate theme layout contract
docs: update deployment guide
refactor(shared): simplify build context
```

## Testing

Plugin tests use Node's built-in test runner:

```bash
pnpm --filter @cogita/plugin-your-feature test
```

Core and plugin tests should cover stable defaults, safe disabling, readable configuration errors, virtual-module contracts, and missing layout behavior.

Full validation:

```bash
pnpm run build:packages
pnpm --filter docs-site build
pnpm run check
pnpm run test
```

Before a release, also run `pnpm run check:release`. It checks package boundaries, minimal consumers, the independent blog consumer, and the independent docs consumer after one package build. The external blog check may skip locally when no sibling `cogita-blog` repository exists; the release workflow checks it explicitly.

## Keep documentation in sync

When code changes, update the package README and the matching page under `docs-site/content`. Add a Changeset when a published package changes. Examples should use current package names such as `@cogita/theme-lucid`, not the retired `'lucid'` shorthand or an old workspace command.

## Published packages

Do not edit package versions by hand. Record release intent with Changesets:

```bash
pnpm changeset
pnpm changeset status
pnpm version-packages
pnpm release
```

## Pre-commit checklist

- [ ] The branch is based on the latest `main`.
- [ ] `pnpm run build:packages` has passed.
- [ ] `pnpm run check` and relevant tests have passed.
- [ ] The docs site builds successfully.
- [ ] READMEs, design docs, and Changesets are synchronized.
- [ ] No private site content or credentials entered the framework repository.
- [ ] The commit message follows Conventional Commits.
