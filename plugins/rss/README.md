# @cogita/plugin-rss

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-rss.svg)](https://badge.fury.io/js/@cogita%2Fplugin-rss)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

[中文](./README.zh-CN.md) | **English**

> RSS, Atom, and JSON Feed generation plugin for Cogita blogs with automatic HTML discovery links.

## What is it?

This plugin automatically generates RSS 2.0, Atom, and JSON Feed files from your blog posts and adds discovery links to HTML pages. It's perfect for readers who want to subscribe to your blog updates.

## Features

✅ **Multiple Feed Formats**
- RSS 2.0 (most widely supported)
- Atom Feed (modern standard)
- JSON Feed (developer-friendly)

✅ **SEO Optimized**
- Automatic HTML `<link>` tag injection
- Proper MIME types and headers
- Search engine friendly URLs

✅ **Highly Configurable**
- Custom feed paths and limits
- Field mapping from frontmatter
- Content inclusion options

✅ **Zero Configuration**
- Works out of the box with sensible defaults
- Automatically detects posts via frontmatter plugin

## Installation

```bash
pnpm add @cogita/plugin-rss
```

> **Note:** This plugin depends on `@cogita/plugin-posts-frontmatter` to access post data.

## Quick Start

### Automatic Usage (Recommended)

The plugin will be automatically included by themes that support it:

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Blog',
    description: 'Sharing my thoughts',
    url: 'https://myblog.com'
  },
  theme: 'lucid' // Theme will auto-load RSS plugin
});
```

### Manual Configuration

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';
import { pluginRSS } from '@cogita/plugin-rss';

export default defineConfig({
  plugins: [
    pluginRSS({
      title: 'My Blog RSS',
      description: 'Latest posts from my blog',
      link: 'https://myblog.com',
      formats: ['rss', 'atom', 'json']
    })
  ]
});
```

## Configuration Options

```typescript
interface RSSConfig {
  // Required
  title: string;           // Feed title
  description: string;     // Feed description  
  link: string;           // Website URL
  
  // Optional
  language?: string;       // Default: 'zh-CN'
  copyright?: string;      // Copyright notice
  managingEditor?: string; // Editor email
  webMaster?: string;      // Webmaster email
  
  // Output options
  formats?: ('rss' | 'atom' | 'json')[]; // Default: ['rss']
  feedPath?: string;       // Default: 'rss.xml'
  atomPath?: string;       // Default: 'atom.xml' 
  jsonPath?: string;       // Default: 'feed.json'
  
  // Content options
  maxItems?: number;       // Default: 20
  includeContent?: boolean; // Default: false
  
  // Field mapping
  customFields?: {
    author?: string;       // Frontmatter field name
    category?: string;     // Frontmatter field name
  };
}
```

## Usage Examples

### Basic RSS Feed

```typescript
pluginRSS({
  title: 'Tech Blog',
  description: 'Latest technology articles',
  link: 'https://techblog.com'
})
```

### Multi-format with Custom Paths

```typescript
pluginRSS({
  title: 'My Blog',
  description: 'Personal blog updates',
  link: 'https://myblog.com',
  formats: ['rss', 'atom', 'json'],
  feedPath: 'feeds/rss.xml',
  atomPath: 'feeds/atom.xml', 
  jsonPath: 'feeds/feed.json',
  maxItems: 50
})
```

### Custom Field Mapping

```typescript
pluginRSS({
  title: 'Developer Blog',
  description: 'Software development insights',
  link: 'https://devblog.com',
  customFields: {
    author: 'writer',      // Use 'writer' field from frontmatter
    category: 'topics'     // Use 'topics' field as categories
  }
})
```

## Generated Files

The plugin generates the following files:

- **`/rss.xml`** - RSS 2.0 feed (if enabled)
- **`/atom.xml`** - Atom feed (if enabled)  
- **`/feed.json`** - JSON Feed (if enabled)

## HTML Integration

The plugin automatically adds discovery links to your HTML:

```html
<head>
  <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
  <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
  <link rel="alternate" type="application/json" title="JSON Feed" href="/feed.json" />
</head>
```

## Frontmatter Support

The plugin works with standard frontmatter fields:

```yaml
---
title: "My First Post"
description: "An introduction to my blog"
date: "2024-01-15"
author: "John Doe"
categories: ["tech", "blog"]
tags: ["introduction", "welcome"]
---
```

## Virtual Module

Access feed metadata in your components:

```typescript
// Available in theme components
import { feedMeta } from 'virtual-rss-meta';

function FeedLinks() {
  return (
    <div>
      {feedMeta.rssUrl && <a href={feedMeta.rssUrl}>RSS</a>}
      {feedMeta.atomUrl && <a href={feedMeta.atomUrl}>Atom</a>}
      {feedMeta.jsonUrl && <a href={feedMeta.jsonUrl}>JSON</a>}
    </div>
  );
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { RSSConfig, FeedMeta } from '@cogita/plugin-rss';
```

## Troubleshooting

### No Posts in Feed

1. Ensure `@cogita/plugin-posts-frontmatter` is loaded first
2. Check that posts exist in your posts directory
3. Verify frontmatter format is valid

### Feed URLs Not Working

1. Check that your `link` configuration is correct
2. Ensure the build completed successfully
3. Verify feed files exist in output directory

## Examples

See the [plugin design document](../../docs/plugins/plugin-rss-design.md) for detailed architecture and more examples.

## License

MIT License. See [LICENSE](./LICENSE) for details.

## Contributing

Contributions welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md).
