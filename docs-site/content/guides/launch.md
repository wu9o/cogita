---
title: Launch kit
---

# Launch kit

This page keeps Cogita's public positioning, demo order, and first-post copy in one place. Use it when sharing the project with people who have not seen the repository before.

## One-sentence positioning

Cogita is a theme-driven static site framework that turns blogs, documentation, and knowledge bases into reusable content ecosystems.

## What to show first

Start with the [theme showcase](https://wu9o.github.io/cogita/demos/), then use the demo that matches the reader's site shape:

1. [Knowledge](https://wu9o.github.io/cogita/demos/knowledge/) — connected posts, documents, JSON, Git sources, search, and backlinks.
2. [Docs](https://wu9o.github.io/cogita/demos/docs/) — handbooks, API references, and focused navigation.
3. [Lucid](https://wu9o.github.io/cogita/demos/lucid/) — personal blogs, archives, topics, and reading flow.
4. [Editorial](https://wu9o.github.io/cogita/demos/editorial/) — feature writing, series, and curated publishing.

Each Demo is an independent site consumer with custom sample content. The repository also contains the configuration and content behind every page.

## The adoption story

Cogita is easiest to understand through three ideas:

- **Choose a site shape** with a theme instead of assembling a visual shell from scratch.
- **Add capabilities by contract** through plugins for search, RSS, SEO, content sources, and more.
- **Keep content independent** so a site can own its Markdown, JSON, or Git-backed repositories.

## Five-minute start

```bash
pnpm dlx @cogita/cli create my-site --template knowledge
cd my-site
pnpm dev
```

For a blog, use `--template blog`; for a handbook, use `--template docs`; for external Git or JSON content, use `--template knowledge-external`.

The [Get started guide](../getting-started.md) explains the smallest configuration. The [theme overview](../themes.md) explains how to choose between the four official themes.

## Suggested post

> Meet Cogita — a theme-driven static site framework for blogs, docs, and knowledge bases.
>
> Pick a site shape, get a complete theme ecosystem, and add capabilities through plugins. The repo includes four independent demos, including a Knowledge theme that connects posts, documents, JSON, and Git sources.
>
> Explore the demos: https://wu9o.github.io/cogita/demos/
> GitHub: https://github.com/wu9o/cogita

## X post variants

### Short post

> Cogita is a theme-driven static site framework for blogs, docs, and knowledge bases.
>
> Choose a site shape, compose capabilities through plugins, and keep your content independent.
>
> Explore four live demos: https://wu9o.github.io/cogita/demos/

### Recommended first thread

#### Post 1

> One framework. Four site shapes.
>
> Cogita is a theme-driven static site framework for blogs, docs, editorial publishing, and knowledge bases.
>
> Themes shape the experience. Plugins add capabilities. Your content stays yours.
>
> Explore the demos: https://wu9o.github.io/cogita/demos/

#### Post 2

> The Knowledge theme is the interesting one: it brings posts, ordinary documents, JSON exports, and Git checkouts into one searchable content index—with topics, backlinks, and traceable routes.
>
> https://wu9o.github.io/cogita/demos/knowledge/

#### Post 3

> Docs for handbooks. Lucid for notes. Editorial for feature writing. Knowledge for connected research.
>
> Each is an independent site consumer with its own configuration and sample content.
>
> Start here: https://wu9o.github.io/cogita/demos/

### Thread outline

1. Start with the problem: a blog, handbook, and knowledge base should not need three unrelated stacks.
2. Show the model: a theme owns the reading experience, plugins add capabilities, and the site owns its content.
3. Open the Knowledge demo to show posts, documents, JSON, Git sources, search, and backlinks in one site shape.
4. Open the Docs, Lucid, and Editorial demos to show the same framework adapting to different publishing modes.
5. End with the Quick Start command and invite feedback about the first real site shape or content source to support.

## Shareable assets

- [Theme showcase](https://wu9o.github.io/cogita/demos/) — the primary link for social posts.
- [Knowledge demo](https://wu9o.github.io/cogita/demos/knowledge/) — the flagship capability demo.
- [Online handbook](https://wu9o.github.io/cogita/) — configuration, architecture, and extension guidance.
- [GitHub repository](https://github.com/wu9o/cogita) — source, templates, and contribution path.
- [Social card source](https://github.com/wu9o/cogita/blob/main/demos/landing/social-card.svg) — the English preview image used by the showcase.
- [Knowledge source diagram](https://github.com/wu9o/cogita/blob/main/demos/knowledge/git-content/assets/content-source.svg) — the Git → ContentIndex → Theme story in one image.

Only publish the links after the Pages workflow has deployed the same commit. Local builds prove the package and page contracts; they do not prove that the public URLs have updated.

## Launch checklist

- [ ] The public homepage and theme showcase load successfully.
- [ ] The four Demo links open the intended site and remain styled.
- [ ] The social card shows the current English positioning.
- [ ] The Quick Start command creates a runnable site.
- [ ] The release and npm package versions match the main branch.
- [ ] The post links to both the showcase and the repository.

## Feedback to collect

Ask early users three questions:

1. Which site shape did you try first: blog, docs, editorial, or knowledge base?
2. Where did the first-run flow become unclear?
3. Which content source or plugin would make Cogita useful for your real site?

Use the answers to choose the next flagship feature instead of expanding the package list without adoption evidence.
