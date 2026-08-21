# @cogita/plugin-blog-list

Cogita 的文章列表、静态分页和时间归档插件。

## 能力

- 构建期生成 `/archive` 文章列表页；
- 支持按创建时间、更新时间或标题排序；
- 支持静态分页；
- 支持按年或按月生成归档页面；
- 通过 `virtual-blog-list-data` 向主题提供列表数据；
- 兼容 `site.base` 子路径部署和现有文章封面元数据。

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

主题需要声明 `pageLayouts.blogList`，并可选声明 `pageLayouts.archive`。主题插件会自动加载 `pluginBlogList`。

## 验证

```bash
pnpm --filter @cogita/plugin-blog-list test
```

测试覆盖配置规范化、稳定排序、分页边界、年度归档、月度归档和非法日期统计。

## 虚拟模块

插件提供 `virtual-blog-list-data`，包含 `allBlogListPages`、`allArchives` 和对应的查询函数。主题可以使用这些数据实现自定义列表布局，而不需要重新扫描文章目录。

## 架构边界

插件负责文章数据的排序、分页、归档和页面路由；主题负责 React 布局和交互；SEO 元数据继续由 `@cogita/plugin-seo` 负责。
