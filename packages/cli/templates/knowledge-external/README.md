# __SITE_TITLE__

This knowledge-base site was generated from the Cogita `knowledge-external` template.
It brings site posts, local handbooks, and an independent Git Markdown repository into one search, topic, relation, and static-page system.

## Local development

```bash
pnpm install
pnpm run doctor
pnpm run dev
```

Put external content in `git-content/`; files are mapped to `/notes/`. You can check out the content repository directly into this directory. The included `.gitkeep` only keeps the directory present for the first build.

## GitHub Pages

The template includes `.github/workflows/deploy.yml`. Configure these values in the site repository:

- Repository variable: `COGITA_CONTENT_REPOSITORY`, for example `your-org/your-notes`.
- Optional repository variable: `COGITA_CONTENT_REF`, to pin a branch, tag, or commit.
- Private content repositories require the `COGITA_CONTENT_TOKEN` repository secret.

If the site is deployed at `https://example.github.io/repository/`, update `site.base` and `site.url` in `cogita.config.ts`, then commit the generated `pnpm-lock.yaml`.

The workflow checks out the site, checks out the external repository into `git-content/`, runs `pnpm exec cogita build`, and publishes `doc_build/`.
