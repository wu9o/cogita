# Categories 插件架构设计与实现方案

**插件名称**：`@cogita/plugin-categories`
**状态**：一期已实现

## 1. 建设目标

分类插件负责把文章 frontmatter 中的 `categories` 数组转换为可访问的分类索引、分类详情页和层级导航。它与 Tags 的区别是：分类支持父子路径，父分类会聚合所有子分类文章；与 Collections 的区别是：分类不要求文章有序，也不要求一篇文章只能归属一个集合。

## 2. 分类声明约定

```yaml
---
categories:
  - 前端/React
  - 工程实践
---
```

`/` 是默认层级分隔符。声明 `前端/React` 时，插件会自动创建 `前端` 和 `前端/React` 两个节点，父节点会包含子节点文章。也可以只使用普通字符串声明扁平分类。

## 3. 配置

```ts
export default defineConfig({
  categories: {
    enabled: true,
    routePrefix: 'categories',
    separator: '/',
    metadata: {
      前端: {
        title: '前端开发',
        description: '前端工程实践与技术探索',
      },
    },
    excludeCategories: [],
    minPostCount: 1,
    sortBy: 'name',
  },
});
```

## 4. 数据流与虚拟模块

```text
posts/*.md
    ↓
PostFrontmatter.categories
    ↓
分类路径规范化、父级补齐、文章去重
    ↓
virtual-categories-data
    ↓
Lucid Category 布局 / 自定义主题
```

虚拟模块提供：

- `allCategories`：按配置排序的分类数组；
- `categoryMap`：按规范化分类路径索引；
- `getCategoryBySlug`：按路由 slug 查询分类；
- `getPostsByCategory`：查询分类文章；
- `getCategoryBreadcrumbs`：生成从根分类到当前分类的面包屑；
- `categoryStats`：总分类数、根分类数、最大分类和平均文章数。

## 5. 路由和主题契约

| 路由 | 页面 |
| --- | --- |
| `/categories` | 分类索引页 |
| `/categories/:slug` | 分类详情页 |
| `/categories/:parent/:child` | 层级分类详情页 |

插件通过 `themeLayouts.category` 使用主题布局。Lucid 主题在同一个布局中根据当前路径区分索引页和详情页，并提供：

- 分类树和文章数量；
- 当前分类的面包屑；
- 子分类导航；
- 当前分类文章列表；
- `site.base` 子路径下的正确链接。

## 6. 插件边界

- 插件只负责构建期扫描、分类树生成、静态路由和虚拟模块；
- 主题负责页面视觉和文章列表渲染；
- SEO 为分类入口和详情页生成页面级元数据；
- Sitemap 在显式配置分类插件后收录分类页面；
- 未配置 `categories` 时插件返回 `null`，不改变已有站点输出。

当前仍保留的架构问题是多个插件重复扫描 frontmatter。Categories 一期沿用 Tags、Collections 和 Search 的独立扫描策略，后续可以由 core 提供共享 `ContentBuildContext` 统一解决。
