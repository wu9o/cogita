---
title: Cogita Documentation
---

# Cogita Documentation

Cogita is a theme-driven static site framework. It separates site configuration, themes, plugins, and content indexes into reusable packages for blogs, project handbooks, and knowledge bases.

## Recommended path

If you are new to Cogita, follow this order:

1. [Get started](./getting-started.md): create and build your first site.
2. [Configuration](./configuration.md): understand site, theme, and plugin options.
3. [Package map](./package-map.md): choose the packages and capabilities your site needs.
4. [Architecture](./api/architecture-design.md): understand build-time and runtime data flow.
5. [Plugin development](./plugins/plugin-development.md): create a reusable build extension.
6. [Theme development](./theme-development.md): publish an independent theme package.

## Documentation areas

- [Guides](./guides/): development, deployment, and long-term site maintenance.
- [Architecture & API](./api/): framework contracts, types, and data flow.
- [Plugin development](./plugins/): plugin APIs, design notes, and extension boundaries.
- [Theme usage and extension](./theme-customization.md): install, configure, and extend themes.
- [Content repository migration](./guides/migration.md): move site content into an independent repository.

## Repository boundary

This repository maintains Cogita's core, plugin, theme, and handbook packages. A site's posts and documents belong to that independent site; the repository demos use small custom datasets only to show how each theme is integrated.

## Contribute

- [Contribution guide](https://github.com/wu9o/cogita/blob/main/CONTRIBUTING.md)
- [Open an issue](https://github.com/wu9o/cogita/issues)
- [Join the discussions](https://github.com/wu9o/cogita/discussions)

The handbook and implementation are maintained together. If an example does not work with the current release, include the Node.js, pnpm, and Cogita versions when reporting it.
