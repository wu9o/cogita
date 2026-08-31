# 构建期内容索引设计

## 背景

文章 frontmatter 是 Cogita 多个插件共同依赖的数据源。此前 `posts-frontmatter`、文章列表、标签、分类、合集、搜索、RSS、SEO、站点地图等插件分别扫描文章目录并解析 frontmatter。文章数量增加后，这种实现会带来重复 IO、重复解析和不同插件数据不一致的问题。

## 第一阶段方案

core 在创建主题插件之前，为每次构建注入一个惰性 `ContentIndex`：

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
  getEntries?(): Promise<readonly ContentEntry[]>;
  getPostContent?(filePath: string): Promise<string>;
  invalidate?(): void;
}
```

索引只在第一个插件调用 `getEntries()` 或 `getPosts()` 时扫描，后续插件复用同一个 Promise。`getEntries()` 返回文章和 `contentDir` 文档，`getPosts()` 保持只返回文章的旧行为。正文通过 `getPostContent(filePath)` 按需读取并缓存，搜索、RSS 等需要全文的插件不再各自重复读取同一文件。core 会在重新触发构建期插件钩子前调用 `invalidate()`，让下一轮构建重新读取文章和文档。`getEntries()` 和正文读取方法都是可选的，以保持第三方插件自行实现 `ContentIndex` 时的兼容性。索引使用与 `posts-frontmatter` 一致的文章路由规则，并根据 `contentDir` 生成普通文档路由。

插件工厂收到的配置现在还包含 `buildContext`。它集中承载 `root`、`cwd`、`contentIndex`、主题布局路径和构建元数据等框架内部状态。旧版插件仍可读取同名顶层字段；新插件应通过 `getCogitaBuildContext(config)` 获取上下文，避免继续扩展配置对象的内部字段。

本阶段已迁移：

- `plugin-posts-frontmatter`：优先使用索引生成 `virtual-posts-data`。
- `plugin-blog-list`：优先使用索引生成列表、筛选、分页和归档数据。
- `plugin-tags`、`plugin-categories`、`plugin-collections`：优先使用索引派生聚合数据。

聚合插件统一使用 `@cogita/shared` 导出的 `ContentPostReference`，不再各自复制文章引用字段；依赖文章能力的插件也只消费 Core 注入的 `ContentIndex`，不再直接依赖文章扫描插件包。
文章运行时虚拟模块 `virtual-posts-data` 额外暴露 `contentDataVersion`，外部主题可据此拒绝不兼容的数据契约。

## 内容关系数据

`@cogita/plugin-content-relations` 是第一个建立在共享索引之上的知识库基础插件。它按需读取
文章正文，提取站内 Markdown 文本链接，并通过 `virtual-content-relations-data` 暴露出链、反向链接
和相关文章查询。插件只消费 `ContentIndex`，不会再次扫描文章目录，也不绑定具体主题的页面布局。

```ts
import {
  getBacklinks,
  getRelatedContent,
} from 'virtual-content-relations-data';

const backlinks = getBacklinks('/posts/current');
const related = getRelatedContent('/posts/current');
```

当前实现的索引对象已经覆盖文章和 `contentDir` 普通文档页，但知识条目的关系类型、来源位置和主题
展示仍未完成。因此它是知识库主题的第一层数据基础，不代表统一知识库主题已经完成；下一步由主题
组合搜索、标签、关系和文档导航。

## 公共契约版本策略

`@cogita/shared` 暴露以下稳定版本字段，新增不兼容字段时递增对应版本：

| 契约 | 版本字段 | 作用 |
| --- | --- | --- |
| 构建上下文 | `COGITA_BUILD_CONTEXT_VERSION` / `buildContext.contractVersion` | 识别 `CogitaBuildContext` 的字段形状 |
| 内容索引 | `COGITA_CONTENT_INDEX_VERSION` / `contentIndex.contractVersion` | 识别 `ContentIndex` 的方法和数据模型 |
| 虚拟模块 | `COGITA_VIRTUAL_MODULE_SCHEMA_VERSION` / `cogitaVirtualModuleVersion` | 识别所有 Cogita 虚拟运行时模块的公共数据头 |
| 文章数据 | `COGITA_CONTENT_DATA_VERSION` / `contentDataVersion` | 保留 `virtual-posts-data` 的文章数据兼容性 |

虚拟模块 ID 统一从 `COGITA_VIRTUAL_MODULE_IDS` 获取，内置文章能力统一使用
`COGITA_CAPABILITIES.CONTENT_POSTS`。第三方插件仍可以声明自己的能力标识，但不应重新定义
`content.posts` 或复用已有虚拟模块 ID。插件生成虚拟模块时应使用
`createCogitaVirtualModule(source)` 写入版本头：

```typescript
import {
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
} from '@cogita/shared';

return {
  [COGITA_VIRTUAL_MODULE_IDS.SEARCH_DATA]: createCogitaVirtualModule(`
    export const searchDocuments = ${JSON.stringify(documents)};
  `),
};
```

`contractVersion` 对第三方兼容实现保持可选，以便旧插件继续工作；Core 创建的原生实现总是提供
版本字段。第三方主题如果消费自己关心的模块，应在版本不兼容时显式降级或给出诊断，而不是静默
按旧字段继续渲染。

- `plugin-search`：优先使用索引生成搜索元数据，正文仅在显式开启正文索引时按文件读取。
- `plugin-rss`、`plugin-seo`、`plugin-sitemap`：优先使用索引生成 Feed、页面 SEO 和站点地图数据。
- `plugin-images`：优先使用索引中的文章封面字段关联公共图片。
- `plugin-reading-progress`、`plugin-comments`：优先使用索引中的文章路径和文件路径。

依赖 `content.posts` 能力的内置插件不再保留独立扫描路径，而是由 Core 在能力契约校验阶段保证索引存在；缺少索引时仅在非严格模式下记录告警并降级为空数据。这样可以避免外部站点同时安装多个文章解析实现，也避免不同插件对同一篇文章产生不一致的解析结果。第三方插件仍可在迁移期通过自己的 `ContentIndex` 实现兼容。

## 边界约束

- `ContentIndex` 属于构建期插件配置，不会进入浏览器运行时。
- `buildContext` 属于构建期上下文，不应被序列化到虚拟运行时模块。
- 共享类型放在 `@cogita/shared`，core 不依赖具体业务插件，避免 core 与插件产生反向耦合。
- 索引只负责发现和解析文章元数据，不负责标签过滤、分页、归档或页面生成。
- 插件仍然负责自己的配置验证、数据转换和虚拟模块输出。

## 后续架构任务

1. ✅ 开发服务器现在监听文章目录、公共资源目录和 Cogita 配置文件。变更发生后会关闭旧 Rspress 实例，重新加载配置并重新执行插件工厂、`beforeBuild`、`addPages` 和 `addRuntimeModules`，因此新增文章、筛选路由和聚合数据可以同步更新。普通正文编辑仍可由 Rspress HMR 处理，完整重建只针对需要重新生成 Cogita 页面数据的输入。
2. ✅ 需要正文的内置插件复用 `getPostContent`，并为第三方索引实现保留摘要降级行为。
3. ✅ 依赖文章能力的内置插件已移除对 `plugin-posts-frontmatter` 的直接依赖；后续只需在发布前持续验证独立消费者构建。
4. ✅ 内容关系插件复用共享索引，提供稳定的 `content.relations` 能力和 `virtual-content-relations-data` 模块。

迁移完成后，主题仍负责声明文章插件，内容消费者插件只依赖共享能力契约；独立插件若要兼容旧版 Core，应自行提供适配层，而不应把旧文章解析实现重新带入核心插件包。
