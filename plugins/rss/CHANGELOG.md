# @cogita/plugin-rss

## 1.0.4

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 1.0.3

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 1.0.2

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
  - @cogita/plugin-posts-frontmatter@0.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

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
