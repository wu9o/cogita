# 兼容性矩阵

本文说明当前 Cogita 包的发布通道、升级边界和验证要求。版本表由 `scripts/check-compatibility-matrix.mjs` 根据各包的 `package.json` 生成；包版本变化时必须同步更新本文档，发布门禁才会通过。

## 兼容性通道

### Core 平台

`@cogita/shared`、`@cogita/core` 和 `@cogita/cli` 属于同一个 Core 发布通道。构建上下文、`ContentIndex`、能力标识或虚拟模块变化时，必须在同一 Changesets 发布批次中验证。不要把未经验证的不同批次 CLI 和 Core 组合使用。

### 博客主题与插件

`@cogita/theme-lucid` 和 `@cogita/theme-editorial` 会组合多个博客插件，属于博客主题通道。主题的 `package.json` 是插件列表的事实来源；升级插件时，至少运行最小博客消费者和真实 `cogita-blog` 消费者。

### Docs 主题

`@cogita/theme-docs` 是独立的文档主题通道，不依赖博客插件集合。应使用独立文档消费者验证首页、文档路由、主题预览和静态输出。

### Knowledge 主题与插件

`@cogita/theme-knowledge` 组合统一内容索引、搜索、标签和内容关系，属于知识库通道。验证时应覆盖文章、`contentDir` 文档、根路径部署和子路径部署。

### 宿主运行时

直接使用 Rspress 的包当前以 `@rspress/core ^1.45.1` 作为兼容基线。主题以 `@rspress/runtime ^1.0.0` 作为 peer 范围，支持 React 18 或 React 19。升级 Rspress 或 React 前，应先建立新的兼容性通道，再更新脚本基线并重跑所有消费者门禁。

## 版本和契约规则

- `0.x` 次版本可能包含公共 API 或构建契约变化，不应按纯补丁升级处理；
- `ContentIndex`、`buildContext` 和虚拟模块形状由 `contractVersion` 或版本头说明，消费者读取新字段前应检查契约；
- 缺少能力时，主题或插件应报告稳定诊断码并安全降级；
- 矩阵只记录已经验证的组合，不能因为预期可用就直接标记为支持。

## 升级流程

1. 修改包版本或公共契约后，运行 `pnpm run check:compatibility -- --write` 更新版本表；
2. 运行 `pnpm run build:packages` 和 `pnpm run test`；
3. 运行 `pnpm run check:release` 验证包边界、最小博客、独立博客和独立文档站；
4. 契约版本变化时补充迁移说明，并验证旧配置如何降级。

兼容性检查属于 `pnpm run check:release` 的一部分。CI 会拒绝只修改包版本而不更新本文档的提交。
