# @cogita/theme-lucid

## 0.10.5

### Patch Changes

- 77e58eb: 新增内容质量与构建诊断插件，支持 frontmatter 必填字段、解析错误、重复路由、本地链接、正文图片引用、图片替代文本和空正文检查，并支持规则级别覆盖、问题忽略和版本化 JSON 报告。
- Updated dependencies [77e58eb]
  - @cogita/plugin-content-check@0.2.0
  - @cogita/shared@0.9.1
  - @cogita/plugin-blog-list@0.3.0
  - @cogita/plugin-categories@0.2.2
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-collections@1.0.2
  - @cogita/plugin-comments@0.2.2
  - @cogita/plugin-images@1.0.2
  - @cogita/plugin-posts-frontmatter@0.1.1
  - @cogita/plugin-reading-progress@0.3.2
  - @cogita/plugin-rss@1.0.2
  - @cogita/plugin-search@0.2.2
  - @cogita/plugin-seo@1.3.2
  - @cogita/plugin-sitemap@1.3.2
  - @cogita/plugin-tags@1.0.2

## 0.10.4

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
- Updated dependencies [cd14acc]
  - @cogita/shared@0.9.0
  - @cogita/plugin-blog-list@0.3.0
  - @cogita/plugin-tags@1.0.2
  - @cogita/plugin-categories@0.2.2
  - @cogita/plugin-collections@1.0.2
  - @cogita/plugin-search@0.2.2
  - @cogita/plugin-rss@1.0.2
  - @cogita/plugin-seo@1.3.2
  - @cogita/plugin-sitemap@1.3.2
  - @cogita/plugin-images@1.0.2
  - @cogita/plugin-reading-progress@0.3.2
  - @cogita/plugin-comments@0.2.2
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.10.3

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/shared@0.8.0
  - @cogita/plugin-blog-list@0.2.1
  - @cogita/plugin-posts-frontmatter@0.1.1
  - @cogita/plugin-categories@0.2.1
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-collections@1.0.1
  - @cogita/plugin-comments@0.2.1
  - @cogita/plugin-images@1.0.1
  - @cogita/plugin-reading-progress@0.3.1
  - @cogita/plugin-rss@1.0.1
  - @cogita/plugin-search@0.2.1
  - @cogita/plugin-seo@1.3.1
  - @cogita/plugin-sitemap@1.3.1
  - @cogita/plugin-tags@1.0.1

## 0.10.2

### Patch Changes

- d6d46df: 代码复制插件支持选中代码内容优先复制，并同步增强 Editorial 与 Lucid 主题的复制按钮提示。
- Updated dependencies [d6d46df]
  - @cogita/plugin-code-copy@0.2.1

## 0.10.1

### Patch Changes

- e09a825: 完善 Lucid 主题的系统与手动暗黑模式，统一导航、卡片、侧栏、文章导航和交互控件的深色配色。
- e09a825: 阅读进度插件新增目录联动和可选的文章阅读位置记忆，两个主题同步提供恢复提示和返回顶部操作。
- e09a825: 统一两个主题的合集、标签、分类和文章导航链接处理，提升子路径部署与静态路由下的链接稳定性。
- e09a825: 抽取主题共用的站点路径解析和日期格式化工具，统一 Editorial 与 Lucid 的页面路由处理。
- Updated dependencies [e09a825]
- Updated dependencies [e09a825]
  - @cogita/plugin-reading-progress@0.3.0
  - @cogita/shared@0.7.1
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-code-copy@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-comments@0.2.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/plugin-tags@1.0.0

## 0.10.0

### Minor Changes

- addea65: 新增代码复制插件，为文章代码块提供可访问的复制按钮和剪贴板回退能力。

### Patch Changes

- Updated dependencies [addea65]
  - @cogita/plugin-code-copy@0.2.0
  - @cogita/shared@0.7.0
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-comments@0.2.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-reading-progress@0.2.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/plugin-tags@1.0.0

## 0.9.0

### Minor Changes

- f02ba04: 新增可选评论插件，支持在文章页接入 Giscus 或 Utterances。

### Patch Changes

- Updated dependencies [f02ba04]
  - @cogita/plugin-comments@0.2.0
  - @cogita/shared@0.6.0
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-reading-progress@0.2.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/plugin-tags@1.0.0

## 0.8.0

### Minor Changes

- d58cf44: 新增阅读进度与预计阅读时间插件，并接入 Lucid 主题。

### Patch Changes

- Updated dependencies [d58cf44]
  - @cogita/plugin-reading-progress@0.2.0
  - @cogita/shared@0.5.0
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/plugin-tags@1.0.0

## 0.7.0

### Minor Changes

- 59cfe60: 新增文章分类插件，支持扁平与层级分类、分类页面、子分类导航、面包屑、SEO 和 sitemap 集成。

### Patch Changes

- Updated dependencies [59cfe60]
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/shared@0.4.0
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-tags@1.0.0

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
