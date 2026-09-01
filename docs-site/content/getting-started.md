---
title: Get started
---

# Get started

Cogita is a theme-driven static site framework built on Rspress. A site needs the Core package, the CLI, and one theme package to get started.

## Create a project from a template

Initialize a site with the CLI:

~~~bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
pnpm dlx @cogita/cli create my-knowledge --template knowledge
~~~

The blog template uses the Lucid theme and a `posts/` directory. The docs template uses the Docs theme and a `content/` directory. The Knowledge template indexes both posts and documents for search, topics, and content relations. Enter the project and run `pnpm run dev`.

The [theme demos](./themes.md#theme-demos) can be built locally with `pnpm run demo`.

## Install manually

~~~bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-docs
~~~

## Create a configuration

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My handbook',
    description: 'A practical project handbook',
  },
  theme: '@cogita/theme-docs',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
  },
});
~~~

## Build the site

~~~bash
pnpm exec cogita build
~~~

The consuming site installs the theme and its declared capabilities. Core loads the configuration, resolves the theme, and assembles Rspress while plugins provide build-time data and runtime modules.
