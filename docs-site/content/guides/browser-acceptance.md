---
title: Browser acceptance
---

# Browser acceptance

Before a release, open the built site in a real browser and verify static HTML, runtime scripts, navigation, and search interactions together. Use an independent `cogita-blog` content repository so the check exercises a real consumer rather than an empty framework fixture.

## Start a preview

Run this from the Cogita repository root:

```bash
pnpm run preview:lucid
```

The default URL is `http://localhost:3034/`. To simulate a GitHub Pages subpath, run this in another terminal:

```bash
BASE_PATH=/cogita-blog/ PORT=3035 pnpm run preview:lucid
```

The subpath preview is available at `http://localhost:3035/cogita-blog/`. `BASE_PATH` updates the site configuration, internal links, and local preview URL together.

## Acceptance checklist

Cover the following scenarios at both the root path and the subpath:

| Scenario | Verify |
| --- | --- |
| Home | The hero, featured posts, recent posts, and navigation render correctly. |
| Post | A post opened from a list shows its title, body, tags, and reading progress. |
| Search | Searching for `Git` returns four results and each result opens. |
| Tags | The `Git` tag page shows the expected posts. |
| Categories | The frontend category page shows its posts and child categories. |
| Archive | The all-posts page and year archive pages open correctly. |
| Subpath | Internal links include `/cogita-blog/`; scripts and styles return no 404. |

After each scenario, check the browser console. There should be no runtime errors or resource-loading warnings. When a check fails, record the URL, console message, and reproduction steps before tracing the build output and configuration flow.

## Related checks

Run this before and after browser acceptance:

```bash
pnpm run check:release
```

This command covers package builds, the compatibility matrix, package boundaries, minimal consumers, the independent blog consumer, and the docs consumer. Browser acceptance adds evidence from real page runtime and interaction.
