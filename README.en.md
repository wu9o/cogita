# Cogita

[中文文档](./README.md) • **English Documentation**

A comprehensive, out-of-the-box static blog system based on Rspress, designed for developers who want to quickly set up and customize their blogs.

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)
[![CI](https://github.com/wu9o/cogita/workflows/CI/badge.svg)](https://github.com/wu9o/cogita/actions/workflows/ci.yml)

## ✨ Features

- 🚀 **True Out-of-the-box**: Zero-config startup, get a full-featured blog in seconds
- 🎨 **Theme-driven Architecture**: Themes are complete ecosystems, not just skins
- 🔧 **Progressive Enhancement**: Smooth transition from zero-config to full customization
- ⚡ **High Performance**: Built on modern Rspress framework with blazing fast builds
- 📝 **Markdown First**: Pure Markdown writing experience, focus on content creation
- 🛡️ **Type Safe**: Full TypeScript support with excellent developer experience

## 🏗️ Unique Architecture

Cogita adopts an innovative **theme-driven architecture** that solves traditional blog framework pain points:

### 🎯 Traditional vs Cogita Approach

```diff
Traditional Approach:
- Choose theme → Manually install plugins → Configure dependencies → Debug compatibility

+ Cogita Approach:
+ Choose theme → Theme auto-declares plugin dependencies → Framework auto-loads → Ready to use
```

### 💡 Core Design Philosophy

- **Convention over Configuration**: Smart defaults minimize configuration burden
- **Themes as Ecosystems**: Themes bundle complete functionality plugin systems
- **Configuration Passthrough**: Retain full Rspress customization capabilities
- **Type-driven**: TypeScript-first development experience

## 🚀 Quick Start

### Get Started in 3 Steps

1. **📦 Install Dependencies**
   ```bash
   # Install core and default theme
   pnpm add @cogita/core @cogita/theme-lucid
   ```

2. **⚙️ Create Configuration**
   
   Create `cogita.config.ts` in your project root:
   ```typescript
   import { defineConfig } from '@cogita/core';

   export default defineConfig({
     site: {
       title: 'My Blog',
       description: 'Documenting my coding journey',
       url: 'https://yourdomain.com',
     },
     
     // Structured plugin configuration
     posts: {
       dir: 'posts',           // Posts directory
       routePrefix: 'posts',   // Route prefix
     },
     
     rss: {
       title: 'My Blog RSS',
       description: 'Latest posts subscription',
       formats: ['rss', 'atom', 'json'],
     },
     
     theme: 'lucid', // Use default theme
     
     // Advanced Rspress config (optional)
     themeConfig: {
       socialLinks: [
         { icon: 'github', mode: 'link', content: 'https://github.com/your-github' },
       ],
     },
   });
   ```

3. **✍️ Start Writing**
   
   ```bash
   # Create posts directory
   mkdir posts
   
   # Create your first post
   echo '---
   title: "Hello Cogita"
   date: "2025-01-01"
   tags: ["hello", "cogita"]
   ---
   
   # Welcome to Cogita
   
   This is my first post!' > posts/hello-cogita.md
   
   # Start development server
   pnpm dev
   ```

## 📦 Ecosystem

### 🧩 Core Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@cogita/cli](./packages/cli) | Command-line interface with dev/build/preview commands | ✅ |
| [@cogita/core](./packages/core) | Intelligent core engine orchestrating themes and plugins | ✅ |
| [@cogita/ui](./packages/ui) | Reusable themeable UI component library | ✅ |
| [@cogita/shared](./packages/shared) | Shared type definitions and utilities | ✅ |

### 🎨 Official Themes

| Theme | Description | Features |
|-------|-------------|----------|
| [@cogita/theme-lucid](./themes/lucid) | Clean and elegant default theme | Responsive design, RSS support, dark mode |

### 🔌 Functional Plugins

| Plugin | Description | Status |
|--------|-------------|--------|
| [@cogita/plugin-posts-frontmatter](./plugins/posts-frontmatter) | Post data extraction and route generation | ✅ Complete |
| [@cogita/plugin-rss](./plugins/rss) | RSS/Atom/JSON Feed subscription generation | ✅ Complete |
| @cogita/plugin-tags | Tag system and tag pages | 🚧 In Development |
| @cogita/plugin-categories | Category system and category pages | 📋 Planned |
| @cogita/plugin-search | Local full-text search functionality | 📋 Planned |
| @cogita/plugin-comments | Comment system integration (Giscus/Gitalk) | 📋 Planned |
| @cogita/plugin-analytics | Website analytics integration | 📋 Planned |

## 🎯 Advanced Configuration

### 📝 Posts Configuration
```typescript
export default defineConfig({
  posts: {
    dir: 'content',           // Custom posts directory
    routePrefix: 'blog',      // Custom route prefix (/blog/xxx)
    extensions: ['md', 'mdx'], // Supported file types
  },
});
```

### 📡 RSS Configuration
```typescript
export default defineConfig({
  rss: {
    title: 'My Tech Blog',
    description: 'Sharing frontend tech and architecture thoughts',
    language: 'en',
    formats: ['rss', 'atom', 'json'],
    maxItems: 50,
    includeContent: true,     // Include full article content
  },
});
```

### 🎨 Theme Customization
```typescript
export default defineConfig({
  themeConfig: {
    // Full Rspress themeConfig support
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/posts' },
      { text: 'About', link: '/about' },
    ],
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/username' },
      { icon: 'twitter', mode: 'link', content: 'https://twitter.com/username' },
    ],
  },
});
```

## 🔬 Technical Architecture

### 🏗️ Layered Design

```
User Layer (config, content)
    ↓
Framework Layer (@cogita/core, @cogita/cli)
    ↓
Theme Layer (@cogita/theme-*)
    ↓
Plugin Layer (@cogita/plugin-*)
    ↓
UI Layer (@cogita/ui, @cogita/shared)
    ↓
Base Layer (Rspress, React)
```

### ⚡ Core Features

- **🔄 Virtual Module System**: Build-time data passing to runtime components
- **🎭 Plugin Factory Pattern**: Flexible plugin instantiation and configuration
- **📊 Type Safety**: Complete TypeScript interface definitions
- **🚀 Incremental Builds**: Only reprocess changed files

## 📚 Documentation

### 📖 User Documentation
- [**Quick Start Guide**](./docs/guides/development.md) ✅
- [**Best Practices**](./docs/guides/best-practices.md) ✅
- [**Deployment Guide**](./docs/guides/deployment.md) ✅

### 👨‍💻 Developer Documentation
- [**Plugin Development Guide**](./docs/plugins/plugin-development.md) ✅
- [**API Reference**](./docs/api/api-reference.md) ✅
- [**Architecture Design**](./docs/api/architecture-design.md) ✅

## 🛠️ Development

### Requirements
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Development Commands
```bash
# Clone repository
git clone https://github.com/wu9o/cogita.git
cd cogita

# Install dependencies
pnpm install

# Build all packages
pnpm run build:packages

# Start example blog
pnpm run dev

# Code quality checks
pnpm run check

# Run tests
pnpm run test
```

## 🗺️ Roadmap

### 🎯 Phase 1: Core Infrastructure (Completed)
- [x] **Core Architecture**: Theme-driven plugin system ✅
- [x] **Configuration Passthrough**: Full Rspress themeConfig access ✅
- [x] **Posts Plugin**: posts-frontmatter core functionality ✅
- [x] **RSS Plugin**: Multi-format subscription generation ✅
- [x] **Default Theme**: Complete lucid theme implementation ✅
- [x] **Plugin System Optimization**: Unified API and type safety ✅

### 🚀 Phase 2: Ecosystem Expansion (In Progress)
- [ ] **Official Plugin Library**: Tags, categories, search, comment systems
- [ ] **Theme Diversity**: At least 2-3 official themes with different styles
- [ ] **Documentation Website**: Complete documentation and example site
- [ ] **Template Repository**: Quick start template collection

### 🔮 Phase 3: Advanced Features (Planned)
- [ ] **Full-text Search**: Algolia/local search based search functionality
- [ ] **SEO Optimization**: Auto sitemap, meta tags, structured data
- [ ] **Social Integration**: Auto sharing, comment systems, social login
- [ ] **Internationalization**: Multi-language blog support and i18n toolchain

## 📊 Project Stats

- 🏗️ **Architecture**: Monorepo + TypeScript + pnpm workspace
- 📦 **Package Count**: 7 core packages + 2 plugins + 1 theme
- 🧪 **Code Quality**: Biome + TypeScript + Publint
- 🚀 **Automation**: GitHub Actions + Changesets
- 📝 **Documentation**: 90%+ API documentation coverage

## 🤝 Community & Contributing

### 🌟 Ways to Participate
- **🐛 Report Issues**: [Issue Tracker](https://github.com/wu9o/cogita/issues)
- **💡 Feature Requests**: [Discussions](https://github.com/wu9o/cogita/discussions)  
- **🔧 Contribute Code**: [Contributing Guide](./CONTRIBUTING.md)
- **📖 Improve Documentation**: Help enhance guides and examples

### 🎯 Areas Seeking Contributions
- **🎨 Theme Development**: Create new theme styles
- **🔌 Plugin Development**: Extend blog functionality
- **📚 Documentation**: Improve guides and best practices
- **🧪 Test Coverage**: Add unit tests and integration tests

## 💝 Acknowledgments

Thanks to all developers and users who contribute to Cogita!

Special thanks to:
- **[Rspress](https://rspress.dev/)** - Powerful static site generator foundation
- **[React](https://reactjs.org/)** - Excellent UI framework
- **Community Contributors** - Every issue, PR, and suggestion is valuable

## 📄 License

MIT © [wu9o](https://github.com/wu9o)

## 🔗 Links

- **🏠 [Main Repository](https://github.com/wu9o/cogita)** - Source code and development
- **📊 [Live Demo](https://wu9o.github.io/cogita/)** - Online demonstration
- **📚 [Documentation](./docs/)** - Complete documentation
- **💬 [Discussions](https://github.com/wu9o/cogita/discussions)** - Community exchange
- **🐛 [Issue Tracker](https://github.com/wu9o/cogita/issues)** - Bug reports and feature requests
- **📖 [Rspress Documentation](https://rspress.dev/)** - Underlying framework docs

---

<div align="center">

**🌟 If Cogita helps you, please give us a Star!**

*Help more developers discover this elegant blogging solution*

[⭐ Star this project](https://github.com/wu9o/cogita) • [🚀 Quick Start](./docs/guides/development.md) • [💬 Join Discussion](https://github.com/wu9o/cogita/discussions)

</div>
