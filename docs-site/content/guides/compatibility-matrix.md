# 兼容性矩阵

本文档描述 Cogita 当前发布包的兼容轨道、升级边界和验证要求。版本表由
`scripts/check-compatibility-matrix.mjs` 根据各包的 `package.json` 生成；如果包版本变化，
必须同步更新文档后才能通过发布门禁。

<!-- compatibility-matrix:start -->
| 包 | 当前版本 | 兼容轨道 | 角色 |
| --- | --- | --- | --- |
| `@cogita/shared` | 0.12.0 | Core 平台 | 公共类型、能力和版本契约 |
| `@cogita/core` | 0.13.0 | Core 平台 | 配置编排、插件注册和构建生命周期 |
| `@cogita/cli` | 0.2.0 | Core 平台 | 站点初始化、开发和构建入口 |
| `@cogita/ui` | 0.1.1 | 主题生态 | 主题共享 UI 组件 |
| `@cogita/plugin-blog-list` | 0.3.3 | 博客主题插件 | 列表、筛选、分页和归档 |
| `@cogita/plugin-categories` | 0.2.5 | 博客主题插件 | 分类聚合和页面 |
| `@cogita/plugin-code-copy` | 0.2.4 | 博客主题插件 | 代码复制运行时增强 |
| `@cogita/plugin-collections` | 1.0.5 | 博客主题插件 | 合集聚合和页面 |
| `@cogita/plugin-comments` | 0.2.5 | 博客主题插件 | 评论配置和文章路由 |
| `@cogita/plugin-content-check` | 0.2.3 | 博客主题插件 | 内容质量诊断 |
| `@cogita/plugin-images` | 1.0.5 | 博客主题插件 | 公共图片和封面处理 |
| `@cogita/plugin-posts-frontmatter` | 0.1.4 | 博客主题插件 | 文章索引和文章页面 |
| `@cogita/plugin-reading-progress` | 0.3.5 | 博客主题插件 | 阅读时间和阅读进度 |
| `@cogita/plugin-rss` | 1.0.5 | 博客主题插件 | RSS、Atom 和 JSON Feed |
| `@cogita/plugin-search` | 0.2.5 | 博客主题插件 | 本地搜索索引和页面 |
| `@cogita/plugin-seo` | 1.3.5 | 博客主题插件 | 页面 SEO 元数据和审计 |
| `@cogita/plugin-sitemap` | 1.3.5 | 博客主题插件 | 站点地图生成 |
| `@cogita/plugin-tags` | 1.0.5 | 博客主题插件 | 标签聚合和页面 |
| `@cogita/theme-lucid` | 0.11.3 | 博客主题 | 默认博客主题和完整插件集成 |
| `@cogita/theme-editorial` | 0.2.9 | 博客主题 | 编辑风格博客主题 |
| `@cogita/theme-docs` | 0.2.1 | 文档主题 | 技术手册和文档站主题 |
<!-- compatibility-matrix:end -->

## 兼容轨道

### Core 平台

`@cogita/shared`、`@cogita/core` 和 `@cogita/cli` 属于同一条 Core 发布轨道。它们可以拥有不同的
包版本号，但涉及构建上下文、`ContentIndex`、能力标识或虚拟模块的变更时，必须在同一个
Changesets 发布批次中验证。CLI 应与 Core 使用同一批次生成的包，不要跨多个未验证的版本组合。

### 博客主题与插件

`@cogita/theme-lucid` 和 `@cogita/theme-editorial` 会组合多个博客插件，属于博客主题轨道。
主题的 `package.json` 是插件清单的事实来源；升级其中一个插件时，至少要运行最小博客消费者和
真实 `cogita-blog` 消费者验证。

### 文档主题

`@cogita/theme-docs` 是独立文档主题轨道，不依赖博客插件集合。它必须通过独立文档消费者验证，
尤其要覆盖首页、文档路由、主题预览和静态产物生成。

### 宿主运行时

当前所有直接使用 Rspress 的包以 `@rspress/core ^1.45.1` 为兼容基线；主题对
`@rspress/runtime` 暴露 `^1.0.0` peer 范围，并支持 React 18 或 React 19。升级 Rspress 或 React
时，应先建立新的兼容轨道，再修改矩阵脚本中的基线并重新跑全部消费者门禁。

## 版本与契约规则

- `0.x` 包的 minor 版本可能包含公共 API 或构建契约变化，不能只按 patch 升级理解。
- 包版本表达发布范围；`ContentIndex`、`buildContext` 和虚拟模块的数据形状由各自的
  `contractVersion` 或版本头表达。消费方应先检查契约版本，再读取新增字段。
- 主题或插件缺少兼容能力时，应通过稳定诊断码报告并降级，不应静默读取未知字段。
- 版本矩阵只登记可验证的当前组合，不把“理论上应该兼容”的组合标记为已支持。

## 升级流程

1. 修改包版本或公共契约后运行 `pnpm run check:compatibility -- --write`，更新版本表。
2. 运行 `pnpm run build:packages` 和 `pnpm run test`，确认本地包和单元测试通过。
3. 运行 `pnpm run check:release`，验证发布包边界、最小博客、独立博客和独立文档站。
4. 如果契约版本发生变化，补充迁移说明，并在真实消费者中验证旧配置的降级行为。

兼容矩阵检查已接入 `pnpm run check:release`。CI 中不允许只修改包版本而不更新矩阵文档。
