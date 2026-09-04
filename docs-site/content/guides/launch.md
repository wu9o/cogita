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
