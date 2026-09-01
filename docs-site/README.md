# Cogita Documentation Site

This is Cogita's technical handbook site, not a personal blog. Documentation lives in [`content/`](./content/); the site uses the independent `@cogita/theme-docs` package and connects ordinary Markdown content through Core's `contentDir` capability. The public handbook and navigation are English-first.

## Local build

```bash
pnpm --filter docs-site build
pnpm --filter docs-site dev
```

Documentation entry points: [online handbook](https://wu9o.github.io/cogita/) · [overview source](./content/overview.md).
