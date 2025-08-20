# @cogita/core

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[中文](./README.zh-CN.md) | **English**

> The intelligent core engine that orchestrates Cogita's theme-driven architecture.

## What is it?

`@cogita/core` is the brain of the Cogita framework. It automatically loads themes, manages plugins, and provides a type-safe configuration system that makes building a blog as simple as choosing a theme.

## Key Features

- 🎨 **Theme-Driven**: Themes automatically load their required plugins
- ⚙️ **Type-Safe Config**: Full TypeScript support with intelligent defaults  
- 🔧 **Zero Config**: Works out-of-the-box, customizable when needed
- ⚡ **Rspress Powered**: Built on the fast and modern Rspress foundation

## Quick Start

### Installation

```bash
pnpm add @cogita/core @cogita/theme-lucid
```

### Basic Usage

Create `cogita.config.ts`:

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Blog',
    description: 'A blog built with Cogita',
  },
  theme: 'lucid', // Theme handles everything else!
});
```

Create your first post in `posts/hello.md`:

```markdown
---
title: "Hello Cogita!"
createDate: "2024-01-01"
---

# Welcome to my blog!
```

Start development:

```bash
pnpm dev
```

That's it! Your blog is ready at `http://localhost:3000`.

## How It Works

1. **Load Config**: Reads your `cogita.config.ts` 
2. **Load Theme**: Automatically loads the specified theme
3. **Register Plugins**: Theme declares its plugin dependencies
4. **Generate Config**: Creates optimized Rspress configuration
5. **Build/Serve**: Powers your blog with Rspress

## Configuration

### Basic Site Config

```typescript
export default defineConfig({
  site: {
    title: 'My Blog',           // Site title
    description: 'My awesome blog',  // Meta description
    base: '/blog/',             // Base URL (for subpaths)
  },
  theme: 'lucid',              // Theme name
});
```

### Advanced Configuration

```typescript
export default defineConfig({
  site: { /* ... */ },
  theme: 'lucid',
  
  // Pass-through to Rspress theme config
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
    ],
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/you' }
    ],
  },
  
  // Pass-through to Rspress build config
  builderConfig: {
    output: { assetPrefix: 'https://cdn.example.com/' }
  },
});
```

## API Reference

### `defineConfig(config: CogitaConfig)`

Type-safe configuration helper.

### `loadCogitaConfig(root?: string)`

Load configuration from project directory.

### Main Types

```typescript
interface CogitaConfig {
  site?: {
    title?: string;
    description?: string; 
    base?: string;
  };
  theme?: string;
  themeConfig?: any;    // Rspress theme config
  builderConfig?: any;  // Rspress builder config
}
```

## Available Themes

- **`lucid`** (default) - Clean, content-focused blog theme
- More themes coming soon...

## Development Commands

```bash
# Development
pnpm dev

# Build 
pnpm build

# Preview build
pnpm preview
```

## Learn More

- 📖 [Complete Documentation](../../docs/README.md)
- 🔧 [API Reference](../../docs/api-reference.md)
- 🏗️ [Architecture Guide](../../docs/architecture-design.md)
- 💡 [Best Practices](../../docs/best-practices.md)
- 🎨 [Theme Development](../../docs/theme-development.md)

## Related Packages

- [🚀 @cogita/cli](../cli) - Command line interface
- [🎨 @cogita/ui](../ui) - UI component library
- [🌟 @cogita/theme-lucid](../../themes/lucid) - Default theme

## License

MIT © [wu9o](https://github.com/wu9o)