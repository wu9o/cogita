# 构建期内容索引设计

## 背景

文章 frontmatter 是 Cogita 多个插件共同依赖的数据源。此前 `posts-frontmatter`、文章列表、标签、分类、合集、搜索、RSS、SEO、站点地图等插件分别扫描文章目录并解析 frontmatter。文章数量增加后，这种实现会带来重复 IO、重复解析和不同插件数据不一致的问题。

## 第一阶段方案

core 在创建主题插件之前，为每次构建注入一个惰性 `ContentIndex`：

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
}
```

索引只在第一个插件调用 `getPosts()` 时扫描，后续插件复用同一个 Promise。索引使用与 `posts-frontmatter` 一致的路由规则，并根据 `posts.dir`、`posts.routePrefix` 和 `posts.extensions` 生成文章数据。

本阶段已迁移：

- `plugin-posts-frontmatter`：优先使用索引生成 `virtual-posts-data`。
- `plugin-blog-list`：优先使用索引生成列表、分页和归档数据。

旧的独立扫描路径仍然保留，确保插件被单独使用、或由旧版本 core 调用时不会失效。

## 边界约束

- `ContentIndex` 属于构建期插件配置，不会进入浏览器运行时。
- 共享类型放在 `@cogita/shared`，core 不依赖具体业务插件，避免 core 与插件产生反向耦合。
- 索引只负责发现和解析文章元数据，不负责标签过滤、分页、归档或页面生成。
- 插件仍然负责自己的配置验证、数据转换和虚拟模块输出。

## 后续迁移顺序

1. 标签、分类、合集：改为从 `ContentIndex` 派生聚合数据。
2. 搜索：复用文章元数据索引，并单独按需读取正文，避免默认构建读取全部正文。
3. RSS、SEO、站点地图、图片：统一使用索引中的文章路由和封面字段。
4. 增加开发模式失效策略：文章文件变化时清理索引 Promise，并只重新解析受影响的文件。

迁移完成后，插件仍需保留无索引兜底路径一段时间，保证插件独立使用和旧版 core 的兼容性。
