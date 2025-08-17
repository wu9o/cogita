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

This plugin is designed to work seamlessly with the Cogita framework and is automatically integrated by themes that require it, such as `@cogita/theme-lucid`.

For the majority of users, **no manual installation or configuration is needed**. Simply use a compatible Cogita theme, and this plugin will work out-of-the-box.

### How It Works

When used within a Cogita theme, the theme signals to `@cogita/core` that this plugin is a dependency. The core then automatically initializes the plugin, feeding it the necessary configuration to find your posts (typically in the `posts/` directory).

The plugin then scans all Markdown files, extracts their frontmatter, and creates a virtual module named `virtual-posts-data`, which exports an `allPosts` array. Theme components can then import this data to render post lists, archives, etc.

### TypeScript Support

Client-side type definitions for the virtual module are available. To enable them, add the following reference to your project's `tsconfig.json` or a `.d.ts` file:

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

### Advanced Usage (Manual Setup)

If you wish to use this plugin with a standard Rspress project (outside of the Cogita framework), you can configure it manually in your `rspress.config.ts`:

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    // The plugin function now accepts the full config object
    (config) => pluginPostsFrontmatter({
      ...config,
      postsDir: '/path/to/your/posts', // Specify the posts directory
      routePrefix: 'blog' // Optional, defaults to 'posts'
    })
  ]
});
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