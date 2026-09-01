---
title: Plugin development
---

# Plugin development

Cogita plugins are factory functions that receive the enhanced site configuration and participate in the Rspress build. A plugin can provide pages, virtual modules, HTML transforms, and build checks, but should not hard-code a theme layout or a site's content.

## Start developing

1. Read the [plugin development guide](./plugin-development.md).
2. Read the [plugin API specification](./plugin-api-specification.md).
3. Review the [Posts Frontmatter design](./plugin-posts-frontmatter-design.md) for a complete data flow.
4. Read the design note for the capability you want to add.

## Plugin design documents

- [i18n](./plugin-i18n-design.md)
- [Posts Frontmatter](./plugin-posts-frontmatter-design.md)
- [RSS](./plugin-rss-design.md)
- [Images](./plugin-images-design.md)
- [Sitemap](./plugin-sitemap-design.md)
- [SEO](./plugin-seo-design.md)
- [Blog List](./plugin-blog-list-design.md)
- [Search](./plugin-search-design.md)
- [Categories](./plugin-categories-design.md)
- [Reading Progress](./plugin-reading-progress-design.md)
- [Code Copy](./plugin-code-copy-design.md)
- [Comments](./plugin-comments-design.md)
- [Content Check](./plugin-content-check-design.md)
- [Content Relations](./plugin-content-relations-design.md)
- [JSON Content Source](./plugin-content-source-json-design.md)
- [Git Content Source](./plugin-content-source-git-design.md)

## Built-in plugin status

The built-in ecosystem covers content indexing, i18n, subscriptions, images, sitemap, SEO, lists, search, categories, reading progress, code copy, comments, content checks, content relations, and external content sources. The implementation status of each capability is defined by its package and design document.
