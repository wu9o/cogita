# @cogita/plugin-categories

Cogita 的文章分类插件，支持扁平分类、使用 `/` 表示的层级分类、分类页面和面包屑导航。

## 配置

```ts
export default defineConfig({
  categories: {
    enabled: true,
    routePrefix: 'categories',
    separator: '/',
    metadata: {
      前端: { title: '前端开发', description: '前端工程实践文章' },
      '前端/React': { title: 'React', description: 'React 相关内容' },
    },
    minPostCount: 1,
    sortBy: 'name',
  },
});
```

文章通过 `categories` 数组声明分类。`前端/React` 会自动生成 `前端` 父分类，父分类文章数会包含所有子分类文章。

插件在构建期生成 `/categories` 和每个分类详情页，并通过 `virtual-categories-data` 向主题暴露分类树、文章引用和面包屑查询函数。未配置分类插件或主题未提供 `pageLayouts.category` 时，插件会优雅跳过。
