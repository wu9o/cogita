---
title: Theme usage and extension
---

# Theme usage and extension

A theme is an independent npm package. In addition to visual styling, it can declare the plugins and page layouts it needs. A site selects the theme in its configuration and installs the theme package directly.

## Install a theme

~~~bash
pnpm add -D @cogita/theme-docs
~~~

Then select it in `cogita.config.ts`:

~~~ts
export default defineConfig({
  theme: '@cogita/theme-docs',
});
~~~

## Theme configuration

Themes receive site-level options through `themeConfig`. Keep navigation, sidebars, and theme-specific options there instead of putting theme implementation details into Core configuration.

## Official themes

| Theme package | Best for | Visual position |
| --- | --- | --- |
| `@cogita/theme-docs` | Cogita handbooks | Documentation navigation, sidebars, and API reading |
| `@cogita/theme-lucid` | Independent blogs and content sites | Lightweight hero, post cards, and content sidebar |
| `@cogita/theme-editorial` | Content-first technical publishing | Editorial typography, featured posts, and focused reading |
| `@cogita/theme-knowledge` | Personal wikis, research notes, and mixed knowledge bases | Unified content, search, topics, and backlinks |

A theme is the site's rendering boundary: Core handles configuration, routes, and builds; plugins provide data; the theme decides how to organize that data. When adding a theme, add a theme package and theme-specific configuration before changing Core.

### Lucid configuration

Lucid reads site branding from `site.title` and `site.description`, and accepts its own options through `themeConfig.lucid`:

~~~ts
export default defineConfig({
  theme: '@cogita/theme-lucid',
  site: {
    title: 'My technical notes',
    description: 'A record of building, debugging, and sustained thinking.',
  },
  themeConfig: {
    lucid: {
      heroEyebrow: 'My Notes',
      heroCopy: 'Turn long-term practice into reusable writing.',
      postsTitle: 'Recently updated',
      showSidebar: true,
      featuredPost: '/posts/introducing-cogita',
    },
  },
});
~~~

`heroEyebrow`, `heroCopy`, `postsTitle`, `showSidebar`, and `featuredPost` are optional. Lucid uses stable English-first defaults when they are omitted; topics, categories, collections, and search remain provided by their respective plugins.

### Knowledge configuration

Knowledge puts `posts` and `contentDir` behind one content entry point and combines search, topics, and content relations by default. It is designed for knowledge bases that need long-term accumulation, cross-references, and revisiting:

~~~ts
export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
~~~

When a site maintains both posts and ordinary documents, Knowledge presents both content types on the home page, in search, and in content relations. Content quality diagnostics remain opt-in through `contentCheck`. See the complete information architecture in the [Knowledge theme guide](./themes/theme-knowledge-design.md).

## Replace and extend

If the page structure needs to change, create your own theme package, reuse the shared types and UI components, and declare the required plugins inside that theme. The site only needs to switch the `theme` package; its content and framework packages do not need to migrate.

See the [theme development guide](./theme-development.md) and [architecture design](./api/architecture-design.md) for layout contracts, plugin dependencies, and theme resolution.