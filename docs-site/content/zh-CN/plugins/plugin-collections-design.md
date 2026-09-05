---
title: 合集插件设计
---

# 合集插件设计

`@cogita/plugin-collections` 用于把文章组织成有序系列，适合教程、课程和播放列表。它与标签的区别是：标签是扁平的多对多关系，合集强调顺序、系列元数据和上一篇/下一篇导航。

## Frontmatter

```yaml
---
title: "React Hooks 入门"
collection: "react-hooks-series"
order: 1
---
```

`collection` 是合集 slug，`order` 控制升序阅读；未提供顺序时按文章创建日期排列。`collectionTitle` 可以覆盖文章在合集中的显示标题。

## 配置

```ts
export default defineConfig({
  collections: {
    enabled: true,
    routePrefix: 'collections',
    metadata: {
      'react-hooks-series': {
        title: 'React Hooks series',
        description: 'A guided series from basics to advanced patterns',
        cover: '/images/covers/react-hooks.png',
      },
    },
    minPostCount: 1,
  },
});
```

## 数据与页面

`virtual-collections-data` 提供合集列表、按 slug 查询、按文章 route 查询、合集文章和统计信息。插件生成 `/collections` 合集索引和 `/collections/:slug` 详情页。

主题可以使用 `pageLayouts.collection` 和 `pageLayouts.collectionIndex`，并提供合集卡片、有序文章列表、合集面包屑和上下篇导航。Lucid 当前把强主题相关的 UI 保留在主题内，没有强行抽取成通用组件。

## 生命周期与边界

插件使用共享文章索引，负责提取、去重、排序、虚拟模块和静态路由；主题负责展示；SEO 和 Sitemap 分别负责元数据和页面收录。未配置时保持零配置输出。

已完成的核心能力包括合集页面、文章页合集导航、暗色模式和 CLI preview。后续可增加阅读进度持久化、合集 OG 图片和独立合集 RSS。

设计选择是使用 frontmatter 而非目录结构：文章可以灵活迁移，且不会与文章扫描模型冲突。v1 使用单个 `collection` 字段，未来再评估多合集数组。
