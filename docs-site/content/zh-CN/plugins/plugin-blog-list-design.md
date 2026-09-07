# Blog List 插件架构设计与实现方案

**文档版本**：1.0
**插件名称**：`@cogita/plugin-blog-list`
**状态**：第一、二期已实现，后续自定义列表能力待建设

## 建设目标

Blog List 是 Cogita 的文章列表与归档能力插件，负责把文章数据组织成可浏览、可分页、可扩展的静态页面。它不重新扫描文章，而是提供主题无关的“文章列表数据 + 静态列表页面”能力。

## 设计原则

1. 插件负责数据和页面路由，主题负责视觉呈现；
2. 配置缺失或明确禁用时返回 `null`，不影响已有站点；
3. 复用 `PostFrontmatter`、`Post` 和共享 `ContentIndex`；
4. 分页和归档在构建期生成，不依赖客户端查询参数；
5. 所有链接基于 `site.base`，兼容子路径部署。

## 功能范围

第一期生成 `/archive` 列表页、页码分页和按年份分组的归档页，并提供 `virtual-blog-list-data`。第二期增加 `/archive/tag/:slug`、`/archive/category/:slug` 筛选页、筛选分页、月度归档和当前筛选导航。客户端全文搜索、服务端 API、草稿和图片处理不属于本插件。

## 配置

```ts
export default defineConfig({
  blogList: {
    enabled: true,
    routePrefix: 'archive',
    pageSize: 10,
    sortBy: 'createDate',
    order: 'desc',
    generateArchives: true,
    archivePrefix: 'archives',
    archiveGranularity: 'year',
  },
});
```

`pageSize` 至少为 1，路由前缀不能包含前导 `/`，未知排序字段回退到 `createDate`。默认值由 Core 的增强配置集中提供。

## 数据流与主题契约

```text
posts/*.md → PostFrontmatter → ContentIndex
→ blog-list 排序、筛选、分页、分组
→ virtual-blog-list-data → BlogList / Archive 布局
```

虚拟模块提供列表页、筛选器、归档和按页或 key 查询的函数。列表数据保留图片插件补充的 `imageAlt`、`imageCaption`、`imageWidth` 和 `imageHeight`。主题通过 `pageLayouts.blogList` 与 `pageLayouts.archive` 消费这些数据。

建议路由包括 `/archive`、`/archive/page/2`、`/archives` 和 `/archives/2026`。Lucid 复用 `PostList` 与封面组件，首页保留最新文章入口，并提供分页、归档导航和空状态。

## 实现边界与验收

插件生命周期分别负责获取索引、生成页面、生成虚拟模块；不修改 Rspress 全局 HTML，也不负责 SEO。它保留独立解析兜底，但排序、筛选、分页和归档算法保持纯函数，以避免插件执行顺序变成隐式契约。

验收重点包括：单页不生成空分页、分页链接正确、日期分组准确、空目录可构建、子路径链接可访问，以及未配置 `blogList` 时现有首页、标签、合集、RSS、Sitemap 和 SEO 行为不变。

## 后续模块关系

```text
plugin-posts-frontmatter → plugin-blog-list
                         ↙                 ↘
                plugin-categories      plugin-search
```

Blog List 是列表体验的基础层，搜索和分类插件可以复用它的规范化索引、筛选和分页模型。
