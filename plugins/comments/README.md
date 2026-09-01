# @cogita/plugin-comments

Connect Giscus or Utterances comments to Cogita article pages. The plugin validates configuration, identifies article routes, and injects runtime configuration; the theme loads the corresponding third-party script.

## Configuration

### Giscus

```ts
export default defineConfig({
  comments: {
    enabled: true,
    provider: 'giscus',
    title: 'Comments',
    giscus: {
      repo: 'your-name/your-public-repo',
      repoId: 'R_kgDOxxxxxx',
      category: 'Announcements',
      categoryId: 'DIC_kwDOxxxxxx',
      mapping: 'pathname',
      reactionsEnabled: true,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'en',
    },
  },
});
```

### Utterances

```ts
export default defineConfig({
  comments: {
    enabled: true,
    provider: 'utterances',
    utterances: {
      repo: 'your-name/your-public-repo',
      issueTerm: 'pathname',
      label: 'comment',
      theme: 'github-light',
    },
  },
});
```

Both services require a public GitHub repository and the site owner to install the corresponding GitHub App. Comment data is stored in GitHub Discussions or Issues; the plugin does not create a database or add a comment SDK dependency.

When `enabled` is `false`, the plugin does not load third-party scripts but still provides a disabled runtime module so themes can build safely.
