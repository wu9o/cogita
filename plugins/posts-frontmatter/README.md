# @cogita/plugin-posts-frontmatter

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter.svg)](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

[中文](./README.zh-CN.md) | **English**

> Core plugin that automatically scans posts and extracts frontmatter data for Cogita themes.

## What is it?

This plugin automatically scans your `posts/` directory, extracts frontmatter from Markdown files, and makes the data available to themes through a virtual module. It's the foundation for blog post lists, archives, and other content-driven features.

## Installation

```bash
pnpm add @cogita/plugin-posts-frontmatter
```

> **Note:** In the Cogita framework, this plugin is automatically included by themes that need it (like `@cogita/theme-lucid`). Manual installation is typically not required.

## How It Works

1. **Scans** all `.md` and `.mdx` files in the posts directory
2. **Extracts** frontmatter metadata from each file
3. **Generates** routes for each post
4. **Creates** a virtual module with all posts data
5. **Provides** data to themes via `virtual-posts-data`

## Usage

### Automatic Usage (Recommended)

Simply use a compatible Cogita theme:

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: 'lucid', // Theme automatically loads this plugin
});
```

### Manual Configuration (Advanced)

For custom setups or Rspress projects:

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    (config) => pluginPostsFrontmatter({
      ...config,
      postsDir: 'posts',
      routePrefix: 'posts',
      cwd: process.cwd(),
    })
  ],
});
```

## Virtual Module

The plugin creates `virtual-posts-data` module:

```tsx
// Available in theme components
import { allPosts } from 'virtual-posts-data';

function BlogHome() {
  const recentPosts = allPosts.slice(0, 5);
  
  return (
    <div>
      {recentPosts.map(post => (
        <article key={post.url}>
          <h2>{post.title}</h2>
          <time>{post.createDate}</time>
          <p>{post.description}</p>
        </article>
      ))}
    </div>
  );
}
```

## Post Format

### Frontmatter Example

```markdown
---
title: "Your Post Title"
description: "Brief description for SEO and sharing"
createDate: "2024-01-01"
updateDate: "2024-01-15"
tags: ["tag1", "tag2"]
categories: ["category1"]
author: "Author Name"
draft: false
featured: true
---

# Your post content starts here

Write your Markdown content...
```

### Supported Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `title` | string | Post title | Filename |
| `description` | string | Post description | - |
| `createDate` | string | Creation date (YYYY-MM-DD) | File creation time |
| `updateDate` | string | Last update date | File modification time |
| `tags` | string[] | Post tags | - |
| `categories` | string[] | Post categories | - |
| `author` | string | Author name | - |
| `draft` | boolean | Draft status | false |
| `featured` | boolean | Featured post | false |

### Date Formats

Supports various date formats:

```yaml
# Recommended
createDate: "2024-01-01"
createDate: "2024-01-01T10:30:00Z"

# Also supported
date: "2024-01-01"          # Alias for createDate
createDate: "Jan 1, 2024"
createDate: "2024/01/01"
```

## Configuration

### Plugin Options

```typescript
interface PluginConfig {
  postsDir?: string;        // Posts directory (default: 'posts')
  routePrefix?: string;     // Route prefix (default: 'posts')
  cwd?: string;            // Project root directory
  sortBy?: string;         // Sort field (default: 'createDate')
  sortOrder?: string;      // Sort order (default: 'desc')
}
```

### Directory Structure

```
posts/
├── hello-world.md        → /posts/hello-world
├── 2024/
│   └── new-year.md      → /posts/2024/new-year
└── tech/
    └── react-tips.md    → /posts/tech/react-tips
```

## Data Structure

### PostFrontmatter Interface

```typescript
interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;         // Absolute file path
  route: string;           // Route path (e.g., '/posts/hello-world')
  url: string;             // Same as route (compatibility)
  createDate: string;      // ISO date string
  updateDate: string;      // ISO date string
  tags?: string[];
  categories?: string[];
  [key: string]: any;      // Additional frontmatter fields
}
```

## TypeScript Support

Add client type definitions:

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

Or in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@cogita/plugin-posts-frontmatter/client"]
  }
}
```

## Customization

### Custom Sort Order

```typescript
// Sort by update date
pluginPostsFrontmatter({
  sortBy: 'updateDate',
  sortOrder: 'desc'
});
```

### Filter Posts

```typescript
// Custom plugin wrapper
export const myPostsPlugin = (config) => {
  const plugin = pluginPostsFrontmatter(config);
  const originalBeforeBuild = plugin.beforeBuild;
  
  plugin.beforeBuild = async function() {
    await originalBeforeBuild?.call(this);
    // Filter out draft posts in production
    if (process.env.NODE_ENV === 'production') {
      allPosts = allPosts.filter(post => !post.draft);
    }
  };
  
  return plugin;
};
```

## Troubleshooting

### Posts Not Showing

Check these common issues:

1. **File location**: Ensure files are in `posts/` directory
2. **File extension**: Use `.md` or `.mdx` extensions
3. **Frontmatter format**: Valid YAML frontmatter
4. **Draft status**: Check if `draft: true` is set

```bash
# Debug: Check posts directory
ls -la posts/

# Debug: Validate frontmatter
head -10 posts/your-post.md
```

### Route Issues

- Avoid special characters in filenames
- Use kebab-case for best SEO
- Check for conflicting routes

### Performance

For large numbers of posts:

```typescript
// Enable caching
export default defineConfig({
  builderConfig: {
    cache: { type: 'filesystem' }
  }
});
```

## Development

```bash
# Clone repository
git clone https://github.com/wu9o/cogita.git
cd cogita/plugins/posts-frontmatter

# Install dependencies
pnpm install

# Build plugin
pnpm build

# Run tests
pnpm test
```

## Learn More

- 📖 [Plugin Development Guide](../../docs/plugin-development.md)
- 🔧 [API Reference](../../docs/api-reference.md)
- 💡 [Best Practices](../../docs/best-practices.md)
- 🏗️ [Architecture Guide](../../docs/architecture-design.md)

## Related Packages

- [🧠 @cogita/core](../../packages/core) - Core blog engine
- [🎨 @cogita/theme-lucid](../../themes/lucid) - Default theme that uses this plugin
- [🎨 @cogita/ui](../../packages/ui) - UI components for displaying posts

## License

MIT © [wu9o](https://github.com/wu9o)