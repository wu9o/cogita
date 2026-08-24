# @cogita/plugin-posts-frontmatter

## 0.1.1

### Patch Changes

- 91ba0ee: 增加构建期共享内容索引，减少文章列表和文章元数据插件的重复扫描，并为后续标签、分类、搜索和 RSS 等插件统一数据来源。

## 0.1.0

### Minor Changes

- 6c06862: 新增页面级 SEO 插件，支持 description、canonical、Open Graph、Twitter Card 和 JSON-LD。

## 0.0.3

### Patch Changes

- 5d28fcd: 新增图片插件，支持公共图片扫描、文章封面元数据、图片尺寸读取、封面缺失校验、使用统计和运行时虚拟模块，并在 Lucid 主题首页展示文章封面；同时透传 Rspress 原生图片放大配置并补充正文图片样式。

## 0.0.2

### Patch Changes

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

## 0.0.1

### Patch Changes

- 53c3517: ### 🎉 Initial Release of Cogita Framework

  This is the first public release of Cogita, an out-of-the-box static blog system based on Rspress.

  **Core Features:**

  - **Theme-Driven Architecture**: Themes are self-contained ecosystems that can declare and automatically register their own plugin dependencies.
  - **Configuration Passthrough**: Enabled direct access to Rspress's `themeConfig` and `builderConfig` for advanced customization.
  - **`@cogita/theme-lucid`**: A fully functional default theme featuring an out-of-the-box post list on the homepage.
  - **`@cogita/plugin-posts-frontmatter`**: The core plugin that automatically scans and provides post data to themes.
  - **Automated Release Workflow**: Set up a professional release pipeline using Changesets and GitHub Actions.
