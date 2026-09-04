---
title: Site upgrade and doctor
description: Use cogita doctor to check long-term site adoption conditions before upgrades and deployments.
---

# Site upgrade and doctor

For a real site that uses Cogita over time, the main risk is not whether one build can finish. It is whether configuration, dependencies, the theme, and content directories remain supportable after an upgrade. `cogita doctor` provides a read-only pre-upgrade check.

## Basic usage

Run this from the site root:

```bash
pnpm exec cogita doctor
```

If the site's `package.json` contains `"doctor": "cogita doctor"`, you can also run `pnpm run doctor`. CLI templates generate this script by default.

The command checks:

- whether the Cogita config exists and can be loaded;
- `package.json`, the lockfile, and the `cogita build` script;
- whether `@cogita/cli`, `@cogita/core`, and the configured theme are declared and resolvable;
- whether the theme exports a valid `getThemeConfig`;
- whether the directory referenced by `contentDir` or `posts.dir` exists.

## Add it to a deployment pipeline

Run the check before the production build:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm exec cogita doctor --strict --json
- run: pnpm run build
```

By default, `doctor` exits unsuccessfully only for errors. `--strict` also treats warnings as failures. For deployment pipelines, use `--strict --json` to preserve a stable `schemaVersion`, check codes, and details that CI can turn into a summary or annotation.

## Interpret results

- `COGITA_DOCTOR_CONFIG_NOT_FOUND`: create `cogita.config.ts` at the site root or initialize the site with `cogita create`.
- `COGITA_DOCTOR_DEPENDENCY_UNRESOLVED`: reinstall dependencies and make sure the lockfile matches `package.json`.
- `COGITA_DOCTOR_THEME_CONTRACT_INVALID`: check the theme version and the layout contract returned by `getThemeConfig`.
- `COGITA_DOCTOR_CONTENT_DIR_NOT_FOUND`: create the content directory or correct the configured path.
- `COGITA_DOCTOR_LOCKFILE_MISSING`: commit the site's lockfile so deployment dependencies remain reproducible.

The command does not upgrade versions, modify dependencies, or run a full production build. Its job is to identify early whether the site is ready to build; the resulting artifacts and page behavior still require a real site build and browser acceptance.
