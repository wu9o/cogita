# 构建期内容索引设计

## 背景

文章 frontmatter 是 Cogita 多个插件共同依赖的数据源。此前 `posts-frontmatter`、文章列表、标签、分类、合集、搜索、RSS、SEO、站点地图等插件分别扫描文章目录并解析 frontmatter。文章数量增加后，这种实现会带来重复 IO、重复解析和不同插件数据不一致的问题。

## 第一阶段方案

core 在创建主题插件之前，为每次构建注入一个惰性 `ContentIndex`：

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
  getPostContent?(filePath: string): Promise<string>;
  invalidate?(): void;
}
```

索引只在第一个插件调用 `getPosts()` 时扫描，后续插件复用同一个 Promise。正文通过 `getPostContent(filePath)` 按需读取并缓存，搜索、RSS 等需要全文的插件不再各自重复读取同一文件。core 会在重新触发构建期插件钩子前调用 `invalidate()`，让下一轮构建重新读取文章。该方法和正文读取方法都是可选的，以保持第三方插件自行实现 `ContentIndex` 时的兼容性。索引使用与 `posts-frontmatter` 一致的路由规则，并根据 `posts.dir`、`posts.routePrefix` 和 `posts.extensions` 生成文章数据。

插件工厂收到的配置现在还包含 `buildContext`。它集中承载 `root`、`cwd`、`contentIndex`、主题布局路径和构建元数据等框架内部状态。旧版插件仍可读取同名顶层字段；新插件应通过 `getCogitaBuildContext(config)` 获取上下文，避免继续扩展配置对象的内部字段。

本阶段已迁移：

- `plugin-posts-frontmatter`：优先使用索引生成 `virtual-posts-data`。
- `plugin-blog-list`：优先使用索引生成列表、筛选、分页和归档数据。
- `plugin-tags`、`plugin-categories`、`plugin-collections`：优先使用索引派生聚合数据。

聚合插件统一使用 `@cogita/shared` 导出的 `ContentPostReference`，不再各自复制文章引用字段。
文章运行时虚拟模块 `virtual-posts-data` 额外暴露 `contentDataVersion`，外部主题可据此拒绝不兼容的数据契约。
- `plugin-search`：优先使用索引生成搜索元数据，正文仅在显式开启正文索引时按文件读取。
- `plugin-rss`、`plugin-seo`、`plugin-sitemap`：优先使用索引生成 Feed、页面 SEO 和站点地图数据。
- `plugin-images`：优先使用索引中的文章封面字段关联公共图片。
- `plugin-reading-progress`、`plugin-comments`：优先使用索引中的文章路径和文件路径。

旧的独立扫描路径仍然保留，确保插件被单独使用、或由旧版本 core 调用时不会失效。

## 边界约束

- `ContentIndex` 属于构建期插件配置，不会进入浏览器运行时。
- `buildContext` 属于构建期上下文，不应被序列化到虚拟运行时模块。
- 共享类型放在 `@cogita/shared`，core 不依赖具体业务插件，避免 core 与插件产生反向耦合。
- 索引只负责发现和解析文章元数据，不负责标签过滤、分页、归档或页面生成。
- 插件仍然负责自己的配置验证、数据转换和虚拟模块输出。

## 后续架构任务

1. ✅ 开发服务器现在监听文章目录、公共资源目录和 Cogita 配置文件。变更发生后会关闭旧 Rspress 实例，重新加载配置并重新执行插件工厂、`beforeBuild`、`addPages` 和 `addRuntimeModules`，因此新增文章、筛选路由和聚合数据可以同步更新。普通正文编辑仍可由 Rspress HMR 处理，完整重建只针对需要重新生成 Cogita 页面数据的输入。
2. ✅ 需要正文的内置插件复用 `getPostContent`，并为第三方索引实现保留摘要降级行为。
3. 保留各插件的独立扫描兜底，待旧版 core 兼容周期结束后再评估移除。

迁移完成后，插件仍需保留无索引兜底路径一段时间，保证插件独立使用和旧版 core 的兼容性。
