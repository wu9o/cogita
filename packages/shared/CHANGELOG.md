# @cogita/shared

## 0.11.0

### Minor Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 0.10.1

### Patch Changes

- 6d38a19: 发布页面路由解析 API，确保主题消费 `getRouteFromPageData` 时，独立项目安装的 shared 包与主题运行时保持兼容。

## 0.10.0

### Minor Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。

## 0.9.1

### Patch Changes

- 77e58eb: 新增内容质量与构建诊断插件，支持 frontmatter 必填字段、解析错误、重复路由、本地链接、正文图片引用、图片替代文本和空正文检查，并支持规则级别覆盖、问题忽略和版本化 JSON 报告。

## 0.9.0

### Minor Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。

## 0.8.0

### Minor Changes

- 91ba0ee: 增加构建期共享内容索引，减少文章列表和文章元数据插件的重复扫描，并为后续标签、分类、搜索和 RSS 等插件统一数据来源。

## 0.7.1

### Patch Changes

- e09a825: 阅读进度插件新增目录联动和可选的文章阅读位置记忆，两个主题同步提供恢复提示和返回顶部操作。
- e09a825: 抽取主题共用的站点路径解析和日期格式化工具，统一 Editorial 与 Lucid 的页面路由处理。

## 0.7.0

### Minor Changes

- addea65: 新增代码复制插件，为文章代码块提供可访问的复制按钮和剪贴板回退能力。

## 0.6.0

### Minor Changes

- f02ba04: 新增可选评论插件，支持在文章页接入 Giscus 或 Utterances。

## 0.5.0

### Minor Changes

- d58cf44: 新增阅读进度与预计阅读时间插件，并接入 Lucid 主题。

## 0.4.0

### Minor Changes

- 59cfe60: 新增文章分类插件，支持扁平与层级分类、分类页面、子分类导航、面包屑、SEO 和 sitemap 集成。

## 0.3.0

### Minor Changes

- 6b48d16: 新增本地文章搜索插件，支持构建期索引、全文搜索、标签分类筛选、Lucid 搜索页面、隐私优先分析事件以及 SEO 和 sitemap 集成。

## 0.2.0

### Minor Changes

- f49bfe4: 新增文章列表插件，支持静态分页、时间归档，并接入 Lucid 主题。

## 0.1.0

### Minor Changes

- 6c06862: 新增页面级 SEO 插件，支持 description、canonical、Open Graph、Twitter Card 和 JSON-LD。

## 0.0.4

### Patch Changes

- 5d28fcd: 新增图片插件，支持公共图片扫描、文章封面元数据、图片尺寸读取、封面缺失校验、使用统计和运行时虚拟模块，并在 Lucid 主题首页展示文章封面；同时透传 Rspress 原生图片放大配置并补充正文图片样式。

## 0.0.3

### Patch Changes

- bd78c85: 新增标签插件完整实现与主题 React 布局方案。

  ## 新功能

  - **@cogita/plugin-tags**：完整的标签管理插件

    - 自动从文章 frontmatter 提取标签，支持中英文
    - 生成标签索引页（/tags）和标签详情页（/tags/:slug）
    - 通过 `virtual-tags-data` 虚拟模块暴露标签数据（allTags、tagMap、getRelatedTags 等）
    - 标签页面使用主题 React 组件布局渲染（而非 Markdown 内容）

  - **@cogita/theme-lucid**：新增标签页布局与首页侧边栏
    - 新增 `TagPageLayout`（layouts/Tag.tsx），消费虚拟模块渲染标签索引页和详情页
    - 首页改为双栏布局：左侧标签云（TagCloud）+ 合集占位，右侧文章列表
    - 标签云点击跳转对应标签详情页

  ## 修复与改进

  - **@cogita/core**：

    - `createRspressConfig` 注入 `themeLayouts`，让 tags 等插件能用主题布局作为 `addPages` 的 filepath
    - `createThemePlugin` 传递 `globalStyles` 给 Rspress，修复 theme.css 从未加载的问题
    - 修正首页 frontmatter 为合法 YAML

  - **@cogita/shared**：

    - `CogitaPluginConfig` 增加 `themeLayouts` 字段
    - `CogitaTheme.pageLayouts` 增加 `tag` / `tagIndex` 可选字段

  - **@cogita/ui**：
    - `TagList` 改用本地 `generateTagSlug`（带兜底），避免 rspress 浏览器端无法 resolve `@cogita/shared`
    - `TagCloud` / `PostList` 样式优化

  ## Breaking Changes

  无。标签插件为新增功能，原有配置不受影响。

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
