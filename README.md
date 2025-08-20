# Cogita

[中文文档](./README.zh-CN.md)

A comprehensive, out-of-the-box static blog system based on Rspress, designed for developers who want to quickly set up and customize their blogs.

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## ✨ Features

- 🚀 **Out-of-the-box**: True zero-config experience to start your blog in seconds.
- 🎨 **Theme-driven**: Themes are not just skins; they are self-contained ecosystems that bundle required plugins and functionalities.
- 🔧 **Extensible**: While Cogita works out-of-the-box, it allows you to tap into the full power of Rspress's configuration for deep customization.
- ⚡ **Fast**: Built on the high-performance Rspress framework.
- 📝 **Markdown Centric**: Enjoy a pure Markdown-based writing experience.

## 💡 Core Concepts

Cogita is built upon a "convention over configuration" philosophy, with a unique **theme-driven architecture**.

- **Themes as Ecosystems**: In Cogita, a theme is more than just a visual layer. It's a complete package that can declare its own plugin dependencies. When you choose a theme, Cogita's core automatically understands and registers all the necessary plugins (like post list generation) required for that theme to function. This provides a truly seamless, out-of-the-box experience.

- **Configuration Passthrough**: Cogita provides a simple configuration layer for blogging needs, but it doesn't hide the power of Rspress. You can directly access and modify the underlying Rspress `themeConfig` through your `cogita.config.ts` file, allowing for advanced customization without ejecting.

## 🚀 Quick Start

Setting up a Cogita blog is incredibly simple.

1.  **Install Dependencies**:

    ```bash
    # Install Cogita core and your chosen theme
    pnpm add @cogita/core @cogita/theme-lucid
    ```

2.  **Create `cogita.config.ts`**:

    Create a `cogita.config.ts` file in your project root:

    ```typescript
    import { defineConfig } from '@cogita/core';

    export default defineConfig({
      site: {
        title: 'Cogita, Ergo Sum',
        description: 'My journey of coding, creating, and thinking.',
      },
      theme: 'lucid', // Specify the theme
      
      // Directly configure Rspress's theme options
      themeConfig: {
        socialLinks: [
          { 
            icon: 'github', 
            mode: 'link', 
            content: 'https://github.com/your-github' 
          },
        ],
      },
    });
    ```

3.  **Create Your First Post**:

    Create a `posts` directory and add your first Markdown file, e.g., `posts/hello-world.md`.

4.  **Run the Dev Server**:

    Add the following script to your `package.json`:
    ```json
    "scripts": {
      "dev": "cogita dev",
      "build": "cogita build"
    }
    ```
    Then, run `pnpm dev` to see your blog in action!

## 📦 Packages

### Core Packages
- **[@cogita/cli](./packages/cli)** - Command Line Interface (CLI) for the Cogita framework.
- **[@cogita/core](./packages/core)** - The core engine that intelligently orchestrates themes and plugins.
- **[@cogita/ui](./packages/ui)** - Shared, themeable UI components for the Cogita ecosystem.
- **[@cogita/theme-lucid](./themes/lucid)** - A lucid, content-focused blog theme for Cogita. (Default Theme)

### Plugins
- **[@cogita/plugin-posts-frontmatter](./plugins/posts-frontmatter)** - Automatically scans posts, extracts frontmatter, and makes it available to themes. ✅
- **@cogita/plugin-blog-list** - Blog list and pagination (Planned)
- **@cogita/plugin-tags** - Tag system (Planned)
- **@cogita/plugin-categories** - Category system (Planned)
- **@cogita/plugin-rss** - RSS feed generation (Planned)
- **@cogita/plugin-sitemap** - Sitemap generation (Planned)
- **@cogita/plugin-search** - Local search functionality (Planned)
- **@cogita/plugin-comments** - Comment system integration (Planned)
- **@cogita/plugin-analytics** - Analytics integration (Planned)

## 📚 Documentation

- [Getting Started](./docs/getting-started.md) (Coming Soon)
- [Configuration](./docs/configuration.md) (Coming Soon)
- [**Plugin Development**](./docs/plugin-development.md) ✅
- [**API Reference**](./docs/api-reference.md) ✅
- [**Architecture Design**](./docs/architecture-design.md) ✅
- [**Best Practices**](./docs/best-practices.md) ✅
- [Theme Customization](./docs/theme-customization.md) (Coming Soon)

## 🏗️ Development

This is a monorepo managed with pnpm workspace.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start the example blog for development
pnpm run dev
```

## 🗺️ Roadmap

Our roadmap is focused on enhancing the stability, ecosystem, and user experience of Cogita.

### Phase 1: Core Foundation (Current)
- [x] **Core Architecture**: Implemented the theme-driven plugin system.
- [x] **Rspress Passthrough**: Enabled `themeConfig` customization.
- [x] **`@cogita/plugin-posts-frontmatter`**: Core plugin for blog post handling.
- [x] **`@cogita/theme-lucid`**: A fully functional default theme.
- [ ] Refine the Plugin API and document it.
- [ ] Add comprehensive unit and integration tests.
- [ ] Improve error handling and CLI feedback.

### Phase 2: Ecosystem Growth
- [ ] **Official Plugins**: Develop essential plugins for tags, categories, and pagination.
- [ ] **More Themes**: Create at least one more official theme with a different style.
- [ ] **Documentation**: Write the official documentation website.
- [ ] **Community Templates**: Encourage and showcase community-developed themes and plugins.

### Phase 3: Advanced Features
- [ ] Full-text search integration.
- [ ] SEO enhancement plugins (sitemap, structured data).
- [ ] Comment system integrations (Giscus, etc.).
- [ ] i18n support for multi-language blogs.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [wu9o](https://github.com/wu9o)

## 🔗 Links

- [GitHub Repository](https://github.com/wu9o/cogita)
- [Issue Tracker](https://github.com/wu9o/cogita/issues)
- [Rspress Documentation](https://rspress.dev/)
