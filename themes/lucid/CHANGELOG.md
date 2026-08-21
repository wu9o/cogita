# @cogita/theme-lucid

## 0.6.0

### Minor Changes

- 6b48d16: 新增本地文章搜索插件，支持构建期索引、全文搜索、标签分类筛选、Lucid 搜索页面、隐私优先分析事件以及 SEO 和 sitemap 集成。

### Patch Changes

- Updated dependencies [6b48d16]
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.2.0
  - @cogita/plugin-sitemap@1.2.0
  - @cogita/shared@0.3.0
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-tags@1.0.0

## 0.5.0

### Minor Changes

- f49bfe4: 新增文章列表插件，支持静态分页、时间归档，并接入 Lucid 主题。

### Patch Changes

- Updated dependencies [f49bfe4]
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-seo@1.1.0
  - @cogita/plugin-sitemap@1.1.0
  - @cogita/shared@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-tags@1.0.0

## 0.4.0

### Minor Changes

- 6c06862: 新增页面级 SEO 插件，支持 description、canonical、Open Graph、Twitter Card 和 JSON-LD。

### Patch Changes

- Updated dependencies [6c06862]
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-seo@1.0.0
  - @cogita/shared@0.1.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-sitemap@1.0.0
  - @cogita/plugin-tags@1.0.0

## 0.3.0

### Minor Changes

- 1836631: 新增 XML 站点地图插件，支持文章 URL、站点 base、lastmod 和自定义地址。

### Patch Changes

- Updated dependencies [1836631]
  - @cogita/plugin-sitemap@0.1.0

## 0.2.1

### Patch Changes

- 5d28fcd: 新增图片插件，支持公共图片扫描、文章封面元数据、图片尺寸读取、封面缺失校验、使用统计和运行时虚拟模块，并在 Lucid 主题首页展示文章封面；同时透传 Rspress 原生图片放大配置并补充正文图片样式。
- Updated dependencies [5d28fcd]
  - @cogita/plugin-images@0.2.0
  - @cogita/shared@0.0.4
  - @cogita/plugin-posts-frontmatter@0.0.3
  - @cogita/plugin-collections@0.1.1
  - @cogita/plugin-rss@0.1.1
  - @cogita/plugin-tags@0.1.1

## 0.2.0

### Minor Changes

- da453e3: feat(collections): 完成合集插件核心功能与文章页合集导航

  合集插件（@cogita/plugin-collections）实现完整功能：

  - 有序系列文章管理（frontmatter collection + order 字段）
  - 自动生成合集索引页和详情页路由
  - 虚拟模块 virtual-collections-data 暴露合集数据和辅助函数
  - 合集元数据覆盖（config.metadata 按 slug 索引）
  - 最小文章数阈值过滤（minPostCount）

  主题 lucid 集成：

  - 新增 Collection.tsx 布局（索引页卡片 + 详情页有序列表双模式）
  - 新增 CollectionNav.tsx 全局组件（文章页合集归属 + 上下篇导航）
  - 首页侧边栏展示合集列表
  - 完整 CSS 样式含响应式和暗色模式支持

  核心框架修复：

  - 修复 createThemePlugin 未传递 globalUIComponents 的 bug
  - 修复 globalStyles 路径截断 bug（?.[0] 取字符串首字符改为直接传递）
  - 新增 CLI preview 命令实现（之前为 TODO）

### Patch Changes

- Updated dependencies [da453e3]
  - @cogita/plugin-collections@0.1.0

## 0.1.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [bd78c85]
  - @cogita/plugin-tags@0.1.0
  - @cogita/shared@0.0.3
  - @cogita/plugin-posts-frontmatter@0.0.2
  - @cogita/plugin-rss@0.1.0

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

- Updated dependencies [d53d5b6]
  - @cogita/plugin-rss@0.1.0
  - @cogita/plugin-posts-frontmatter@0.0.2
  - @cogita/shared@0.0.2

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

- Updated dependencies [53c3517]
  - @cogita/plugin-posts-frontmatter@0.0.1
  - @cogita/shared@0.0.1
