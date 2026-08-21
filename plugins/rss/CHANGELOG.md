# @cogita/plugin-rss

## 1.0.0

### Patch Changes

- Updated dependencies [6c06862]
  - @cogita/plugin-posts-frontmatter@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [5d28fcd]
  - @cogita/plugin-posts-frontmatter@0.0.3

## 0.1.0

### Minor Changes

- d53d5b6: feat: optimize plugin system architecture

  - Standardize plugin factory pattern for consistent API across all plugins
  - Enhance framework configuration handling with comprehensive type safety
  - Move configuration validation responsibility from themes to plugins
  - Add structured configuration namespaces (posts, rss) with proper defaults
  - Improve error handling and graceful degradation when plugins fail
  - Maintain backward compatibility with existing configurations

  **Key improvements:**

  - Unified plugin declaration in themes: `plugins: [pluginPostsFrontmatter, pluginRSS]`
  - Enhanced `CogitaFullConfig` with framework metadata and smart defaults
  - Plugin-level configuration validation instead of theme-level
  - Structured configuration: `config.posts` and `config.rss`
  - Better TypeScript support with detailed type definitions

  **Migration notes:**

  - RSS plugin now auto-detects configuration from `config.rss` field
  - Posts plugin supports both new structured config and legacy direct access
  - Themes no longer need complex configuration handling logic

### Patch Changes

- Updated dependencies [d53d5b6]
  - @cogita/plugin-posts-frontmatter@0.0.2

## [0.0.1] - 2025-01-XX

### Added

- ✨ Initial RSS plugin implementation
- 📦 RSS 2.0 feed generation with full XML support
- 📦 Atom feed generation with modern standards
- 📦 JSON Feed generation for API-friendly subscriptions
- 🔍 Automatic HTML `<link>` tag injection for feed discovery
- 🛠️ Comprehensive configuration options
- 🔧 Custom field mapping from frontmatter
- 📝 Virtual module for accessing feed metadata
- 🌐 Multi-language support (Chinese and English documentation)
- ⚡ Zero-configuration startup with intelligent defaults
- 🎯 TypeScript support with complete type definitions
- 📋 Integration with `@cogita/plugin-posts-frontmatter`
- 🚀 Phase 1 implementation as per design document

### Technical Features

- **Multi-format Support**: RSS 2.0, Atom, and JSON Feed
- **SEO Optimization**: Proper MIME types, HTTP headers, and discovery links
- **Error Handling**: Graceful fallback when posts data unavailable
- **Performance**: Build-time generation with zero runtime overhead
- **Extensibility**: Plugin architecture compatible with Cogita ecosystem

### Documentation

- 📚 Complete README in English and Chinese
- 🏗️ Comprehensive design document
- 🔧 Configuration examples and usage guides
- 📖 TypeScript API documentation
- 🧪 Troubleshooting guides

### Dependencies

- **Required**: `@rspress/core` ^1.45.1
- **Peer**: `@cogita/plugin-posts-frontmatter` (workspace)
- **Dev**: TypeScript, Rslib build system

---

**Status**: 🚧 Development Phase  
**Next**: Phase 2 - Content enhancement and advanced features
