---
title: 分类插件设计
---

# 分类插件设计

`@cogita/plugin-categories` 将 frontmatter 中的 `categories` 转换为分类索引、详情页和层级导航。分类支持父子路径；与合集不同，它不要求顺序，也不限制文章归属模型。

## 分类声明

```yaml
---
categories:
  - 前端/React
  - 工程实践
---
```

默认使用 `/` 作为层级分隔符。声明 `前端/React` 时会自动补齐 `前端` 节点，父节点聚合子分类文章。

## 配置与数据

```ts
export default defineConfig({
  categories: {
    enabled: true,
    routePrefix: 'categories',
    separator: '/',
    minPostCount: 1,
    sortBy: 'name',
  },
});
```

`virtual-categories-data` 提供 `allCategories`、`categoryMap`、按 slug 查询、按分类查询文章、面包屑和统计数据。

## 页面与边界

| 路由 | 页面 |
| --- | --- |
| `/categories` | 分类索引 |
| `/categories/:slug` | 分类详情 |
| `/categories/:parent/:child` | 层级分类详情 |

插件负责扫描、分类树、静态路由和虚拟模块；主题负责视觉和文章列表；SEO 负责页面元数据；Sitemap 只在显式启用后收录分类页面。

未配置分类时插件返回 `null`，不改变已有站点输出。后续应让分类与标签、搜索共享 Core 的 `ContentIndex`，避免重复扫描。
