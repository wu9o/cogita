---
title: Deployment guide
---

# Deployment guide

Cogita produces a directory that any static file server can host. This repository uses `docs-site` as its handbook example; an independent blog or documentation site only needs its own content directory and configuration.

## Build the site

From the Cogita repository:

```bash
pnpm install --frozen-lockfile
pnpm run build:docs
```

The output is written to `docs-site/doc_build`. An independent site runs `pnpm exec cogita build`, which normally writes to its own `doc_build` directory.

## GitHub Pages

### GitHub Actions

The repository provides `.github/workflows/deploy.yml`. It:

1. installs Node.js and pnpm;
2. builds the workspace packages;
3. builds `docs-site`;
4. builds the four theme demos into `docs-site/doc_build/demos/`;
5. uploads `docs-site/doc_build` to GitHub Pages.

Set **Pages / Build and deployment / Source** to **GitHub Actions**, then push to `main`.

The `site.base` value must match the deployment path. The `wu9o/cogita` repository uses:

```ts
export default defineConfig({
  site: {
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
  },
});
```

For a custom domain, `base` is usually `/`; update `url` at the same time.

After deployment, the handbook is available at `/cogita/`, the demo index at `/cogita/demos/`, and each theme demo below its own directory. Demo builds use the same `/cogita/` prefix as Pages; local `pnpm run demo` uses `/demos/`.

### Independent site repositories

An independent site can reuse the same workflow with its own build and publish directory:

```yaml
- run: pnpm exec cogita build
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./doc_build
```

Do not copy the framework repository's `docs-site` path into an independent site. The publish directory should always be the actual build output.

If content lives in another Git repository, add a second `actions/checkout` before the site build and check it out to the directory configured by `createGitContentSource`. The repository includes [`examples/github-actions/external-content-deploy.yml`](https://github.com/wu9o/cogita/blob/main/examples/github-actions/external-content-deploy.yml) as a starting point.

Public content repositories can use the default `github.token`. For private repositories, keep `COGITA_CONTENT_REPOSITORY`, optional `COGITA_CONTENT_REF`, and `COGITA_CONTENT_TOKEN` in repository variables and Secrets. Never place credentials in site configuration or plain workflow text.

## Vercel

For a Vercel project rooted at the repository root:

- **Framework Preset**: Other
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run build:docs`
- **Output Directory**: `docs-site/doc_build`

If the Vercel root directory is already `docs-site`, use `pnpm exec cogita build` and `doc_build` instead. Choose one layout; do not combine root-directory and repository-root paths.

## Netlify

Recommended settings from the repository root:

- **Base directory**: empty
- **Build command**: `pnpm run build:docs`
- **Publish directory**: `docs-site/doc_build`

To publish manually:

```bash
pnpm run build:docs
pnpm dlx netlify-cli deploy --prod --dir=docs-site/doc_build
```

## Cloudflare Pages

When the project root is the repository root:

- **Build command**: `pnpm run build:docs`
- **Build output directory**: `docs-site/doc_build`
- **Root directory**: `/`

When `docs-site` is the root directory, use `pnpm exec cogita build` and `doc_build`.

## Any static server

Preview the output with any static server:

```bash
pnpm run build:docs
pnpm dlx serve docs-site/doc_build
```

Python works as well:

```bash
python -m http.server 8000 --directory docs-site/doc_build
```

Open `http://localhost:8000` and check pages, assets, and internal links.

## Docker

This Dockerfile works from the framework repository root:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY plugins ./plugins
COPY themes ./themes
COPY docs-site ./docs-site

RUN pnpm install --frozen-lockfile
RUN pnpm run build:docs

FROM nginx:alpine
COPY --from=builder /app/docs-site/doc_build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and start it with:

```bash
docker build -t cogita-docs .
docker run --rm -p 8080:80 cogita-docs
```

## Pre-deployment checks

At minimum, run:

```bash
pnpm run build:docs
pnpm run check
pnpm run test
```

Then verify that:

- the output contains `index.html`;
- `site.base` matches the deployment path;
- the theme and plugins resolve from the current site's dependencies;
- articles, images, feeds, and internal links do not point to retired blog paths.

## Troubleshooting

### GitHub Pages shows 404

Check that `site.base`, `site.url`, and `builderConfig.output.assetPrefix` use the same base path. Rebuild after changing them; refreshing an old `doc_build` directory is not enough.

### The page loads but assets return 404

The host path and `base` usually disagree. Repository Pages uses `/repository-name/`; a custom domain uses `/`. Do not mix the two configurations.

### A theme or plugin cannot be resolved

Themes and plugins are installed by the consumer site. Confirm the dependency exists in `package.json`, then run:

```bash
pnpm install --frozen-lockfile
pnpm run build:packages
```

### Local and production paths differ

Local development can use `/`, while production must use the public path. Build once with production configuration and run `pnpm --filter docs-site preview` before publishing.
