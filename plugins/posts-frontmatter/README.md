# @cogita/plugin-posts-frontmatter

[中文文档](./README.zh-CN.md)

A Rspress plugin to extract and provide frontmatter data from all posts with virtual module support.

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter.svg)](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## Installation

```bash
npm install @cogita/plugin-posts-frontmatter
```

## Usage

### 1. Configure the plugin in rspress.config.ts

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    pluginPostsFrontmatter({
      postsDir: '/path/to/your/posts',
      routePrefix: 'blog' // Optional, defaults to 'posts'
    })
  ]
});
```

### 2. Setup TypeScript support

Add type reference in your project's `tsconfig.json` or `env.d.ts` file:

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

Or in your `env.d.ts` file:

```typescript
import '@cogita/plugin-posts-frontmatter/client';
```

### 3. Use in components

```typescript
import { allPosts } from 'virtual-posts-data';

export function BlogList() {
  return (
    <div>
      {allPosts.map(post => (
        <div key={post.route}>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <p>Created: {post.createDate}</p>
        </div>
      ))}
    </div>
  );
}
```

## API

### PostFrontmatter

```typescript
interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
}
```

### PluginOptions

```typescript
interface PluginOptions {
  postsDir: string;      // Absolute path to the posts directory
  routePrefix?: string;  // Route prefix for generated routes, defaults to 'posts'
}
```

## Virtual Module

The plugin creates a virtual module named `virtual-posts-data` that exports an `allPosts` array containing frontmatter data from all posts.

## Development

```bash
# Clone the repository
git clone https://github.com/wu9o/cogita.git
cd cogita/packages/plugin-posts-frontmatter

# Install dependencies
pnpm install

# Build
pnpm build

# Development mode
pnpm dev
```

## Contributing

Issues and Pull Requests are welcome!

## License

MIT © [wu9o](https://github.com/wu9o)

## Links

- [GitHub Repository](https://github.com/wu9o/cogita)
- [Issue Tracker](https://github.com/wu9o/cogita/issues)
- [Rspress Documentation](https://rspress.dev/)