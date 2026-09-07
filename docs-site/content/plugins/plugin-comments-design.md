---
title: Comments plugin
---

# Comments plugin

## Goal

`@cogita/plugin-comments` provides optional third-party comments for article pages. The first release supports Giscus, backed by GitHub Discussions, and Utterances, backed by GitHub Issues.

The plugin has no database, does not call the GitHub API during the build, and does not bundle provider scripts into Cogita. Lucid loads a provider script dynamically only when the site has explicitly enabled comments and passed configuration validation.

## Configuration boundary

```ts
comments: {
  enabled: true,
  provider: 'giscus',
  title: 'Comments',
  giscus: {
    repo: 'owner/public-repo',
    repoId: '...',
    category: 'Announcements',
    categoryId: '...',
    mapping: 'pathname',
  },
}
```

- `enabled` is off by default, so an incomplete GitHub setup never loads a third-party script accidentally.
- Giscus requires a public repository, repository ID, Discussion category, and category ID.
- Utterances requires a public repository; `issueTerm: 'specific'` also requires `term`.
- Incomplete configuration warns and stays disabled without blocking the blog build.

## Data flow and privacy

```text
cogita.config.ts → Core defaults → virtual-comments-data
→ Lucid checks the article route → dynamically load Giscus / Utterances
```

The virtual module contains only the resolved configuration and article route list. It never contains GitHub tokens, comment content, or local file paths. Provider authorization remains with Giscus, Utterances, and GitHub OAuth. A failed script load produces an accessible error state instead of an empty region.

## Example site

The Knowledge demo uses the public [`wu9o/cogita-comments`](https://github.com/wu9o/cogita-comments) repository and its `General` Discussions category. Before enabling comments, install the [Giscus GitHub App](https://github.com/apps/giscus).

## Future work

- switch Giscus and Utterances themes with the site color mode;
- improve loading-failure feedback;
- evaluate additional providers one by one for cost, privacy, and script stability.

For the Chinese version, see [评论插件设计](../zh-CN/plugins/plugin-comments-design.html).
