# @cogita/plugin-posts-frontmatter

## 0.1.5

### Patch Changes

- Updated dependencies [1a78273]
  - @cogita/shared@0.12.1

## 0.1.4

### Patch Changes

- 03fc3c6: 补充插件发布包的默认入口条件，兼容 Core 通过配置加载器读取主题时的运行时解析路径。
- 03fc3c6: 固化构建上下文、ContentIndex、内置能力标识和虚拟模块 ID 的共享契约，并为 Core 与内置插件的虚拟模块统一增加版本头，方便主题和第三方消费者进行兼容性检查。
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
  - @cogita/shared@0.12.0

## 0.1.3

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 0.1.2

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。

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
