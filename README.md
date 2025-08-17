# Cogita

[中文文档](./README.zh-CN.md)

A comprehensive, out-of-the-box static blog system based on Rspress, designed for developers who want to quickly set up and customize their blogs.

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## ✨ Features

- 🚀 **Out-of-the-box**: Zero configuration to get started
- 🎨 **Customizable**: Plugin-based architecture for easy customization
- 📱 **Responsive**: Mobile-first design with modern UI
- ⚡ **Fast**: Built on Rspress for optimal performance
- 🔍 **SEO Friendly**: Built-in SEO optimization
- 📝 **Markdown**: Full markdown support with extensions
- 🏷️ **Tags & Categories**: Organize your posts efficiently
- 🔗 **RSS & Sitemap**: Built-in feed generation
- 🌙 **Dark Mode**: Automatic dark/light theme switching

## 🚀 Quick Start

### Using CLI (Recommended)

```bash
# Create a new blog (Coming Soon)
npx create-cogita-blog my-blog --template tech-blog

# Enter the directory
cd my-blog

# Start development server
npm run dev

# Deploy to GitHub Pages
npm run deploy
```

### Try the Live Demo

🌐 **Live Demo**: [https://wu9o.github.io/cogita/](https://wu9o.github.io/cogita/)

The demo showcases a personal blog built with Cogita, featuring:
- Responsive design with dark/light mode
- Blog post management with frontmatter
- Tag and category organization
- SEO optimization
- Fast loading and navigation

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/wu9o/cogita.git
cd cogita

# Install dependencies
pnpm install

# Start development
pnpm run dev
```

## 📦 Packages

### Core Packages
- **@cogita/core** - Core blog system (Coming Soon)
- **@cogita/theme-blog** - Default blog theme (Coming Soon)
- **@cogita/create-cogita-blog** - CLI scaffolding tool (Coming Soon)

### Plugins
- **[@cogita/plugin-posts-frontmatter](./packages/plugin-posts-frontmatter)** - Post frontmatter management ✅
- **@cogita/plugin-blog-list** - Blog list and pagination (Planned)
- **@cogita/plugin-tags** - Tag system (Planned)
- **@cogita/plugin-categories** - Category system (Planned)
- **@cogita/plugin-rss** - RSS feed generation (Planned)
- **@cogita/plugin-sitemap** - Sitemap generation (Planned)
- **@cogita/plugin-search** - Local search functionality (Planned)
- **@cogita/plugin-comments** - Comment system integration (Planned)
- **@cogita/plugin-analytics** - Analytics integration (Planned)

## 🎨 Templates

- **minimal** - Clean and simple design (Planned)
- **tech-blog** - Technical blog template (Planned)
- **personal** - Personal blog template (Planned)

## 📚 Documentation

- [Getting Started](./docs/getting-started.md) (Coming Soon)
- [Configuration](./docs/configuration.md) (Coming Soon)
- [Plugin Development](./docs/plugin-development.md) (Coming Soon)
- [Theme Customization](./docs/theme-customization.md) (Coming Soon)

## 🏗️ Development

This is a monorepo managed with pnpm workspace.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Build specific plugin
pnpm run build:plugin

# Start blog development
pnpm run dev

# Run tests
pnpm run test
```

## 🗺️ Roadmap

### Phase 1: Core Foundation (Current)
- [x] Project architecture setup
- [x] plugin-posts-frontmatter
- [ ] @cogita/core package
- [ ] @cogita/theme-blog
- [ ] create-cogita-blog CLI

### Phase 2: Plugin Ecosystem
- [ ] Blog list and pagination
- [ ] Tags and categories system
- [ ] RSS feed generation
- [ ] Sitemap generation

### Phase 3: Advanced Features
- [ ] Local search functionality
- [ ] Comment system integration
- [ ] Analytics integration
- [ ] Multiple template support

### Phase 4: Ecosystem Growth
- [ ] Documentation website
- [ ] Community plugins
- [ ] Theme marketplace

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [wu9o](https://github.com/wu9o)

## 🔗 Links

- [GitHub Repository](https://github.com/wu9o/cogita)
- [Issue Tracker](https://github.com/wu9o/cogita/issues)
- [Rspress Documentation](https://rspress.dev/)
