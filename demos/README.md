# Cogita Theme Demos

Each directory is an independent Cogita site consumer with custom sample content for one official theme. The demos do not depend on `blog/` or reuse an external content site, so they can be read on GitHub and previewed locally. Every demo uses English-first UI configuration.

## Run the showcase

From the repository root:

```bash
pnpm install
pnpm run demo
```

Open <http://localhost:3100/>. The landing page links to four independent demos:

Start with `Knowledge` to see Cogita's long-term knowledge-base direction, then compare `Docs`, `Lucid`, and `Editorial` for different reading and publishing workflows. The landing page also includes a copyable CLI command that shows the path from a starter template to a working site.

| Demo | Theme | Sample content |
| --- | --- | --- |
| `/demos/docs/` | `@cogita/theme-docs` | Northstar Engineering Handbook |
| `/demos/lucid/` | `@cogita/theme-lucid` | Field Notes practice journal |
| `/demos/editorial/` | `@cogita/theme-editorial` | The Small Systems Review |
| `/demos/knowledge/` | `@cogita/theme-knowledge` | Atlas of Practice knowledge base with JSON and Git sources |

`pnpm run demo` builds Core, plugins, themes, and all four demos before starting a static preview server. Use `pnpm run build:demos` when you only need the build output.

## Develop one demo

Each demo also has an independent development server:

```bash
pnpm --filter @cogita/demo-docs dev
pnpm --filter @cogita/demo-lucid dev
pnpm --filter @cogita/demo-editorial dev
pnpm --filter @cogita/demo-knowledge dev
```

When adding an official theme, add `demos/<theme>/package.json`, `cogita.config.ts`, and custom content. Also add the entry to `scripts/serve-demos.mjs` and the landing page. Structural checks ensure that every official theme has a readable, buildable demo.
