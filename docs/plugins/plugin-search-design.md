# Search 插件架构设计与实现方案

**文档版本**：1.0
**创建日期**：2026 年 8 月 21 日
**插件名称**：`@cogita/plugin-search`
**状态**：一期方案完成，待实现

## 1. 建设目标

Search 插件为 Cogita 提供可复用的本地文章搜索索引和搜索页面能力。它建立在 `plugin-posts-frontmatter` 的文章数据之上，并与 Rspress 自带的搜索入口保持兼容。

当前页面已经能看到 Rspress 的 `Search Docs` 入口，但项目没有一个由 Cogita 统一管理的文章搜索数据契约，因而存在以下边界：

- 主题无法稳定消费包含标签、分类、摘要和封面信息的文章索引；
- 搜索字段和索引大小没有统一配置；
- 未来的标签、分类和文章列表筛选需要重复扫描文章；
- Rspress 内部的 `virtual-search-*` 模块属于底层实现，不适合作为 Cogita 插件之间的公共 API。

一期重点是建立 Cogita 自己的搜索索引和主题契约，不替换 Rspress 内部搜索实现。

## 2. 设计原则

1. **新增独立虚拟模块**：使用 `virtual-search-data`，不覆盖 Rspress 的 `virtual-search-index-hash` 或 `virtual-search-hooks`。
2. **构建期生成，运行时查询**：文章扫描和内容清洗在构建期完成，浏览器只加载可搜索字段。
3. **搜索页面与搜索组件解耦**：插件提供索引和页面路由，主题决定输入框、结果卡片和交互样式。
4. **默认控制索引体积**：默认索引标题、摘要、标签和分类；全文内容必须显式开启。
5. **复用文章数据契约**：索引文档以 `PostFrontmatter` 为基础，不重新定义文章路由规则。
6. **渐进式增强**：一期支持标题、摘要、标签和分类搜索；全文搜索、结果高亮和高级过滤后续增加。

## 3. 一期功能范围

- 新增 `@cogita/plugin-search` 包；
- 配置缺失或 `enabled: false` 时返回 `null`；
- 构建期扫描文章并生成标准化搜索文档；
- 生成 `virtual-search-data` 虚拟模块；
- 提供 `/search` 静态搜索页面布局入口；
- Lucid 主题增加搜索页面和结果展示；
- 支持 `site.base` 子路径部署；
- SEO 为搜索页生成普通页面级元数据，sitemap 默认不收录无查询结果的搜索入口之外的动态查询地址。

一期暂不实现：

- 服务端搜索或外部搜索服务；
- 搜索分析和用户行为上报；
- 替换 Rspress 内部搜索弹窗；
- 搜索结果分页；
- 复杂布尔表达式和全文高亮。

## 4. 配置设计

配置放在 `config.search` 命名空间：

```ts
export default defineConfig({
  search: {
    enabled: true,
    routePrefix: 'search',
    includeContent: false,
    maxContentLength: 12_000,
    maxResults: 20,
    minQueryLength: 1,
    fields: {
      title: true,
      description: true,
      excerpt: true,
      tags: true,
      categories: true,
      content: false,
    },
  },
});
```

建议类型：

```ts
interface SearchFieldsConfig {
  title?: boolean;
  description?: boolean;
  excerpt?: boolean;
  tags?: boolean;
  categories?: boolean;
  content?: boolean;
}

interface SearchConfig {
  enabled?: boolean;
  routePrefix?: string;
  includeContent?: boolean;
  maxContentLength?: number;
  maxResults?: number;
  minQueryLength?: number;
  fields?: SearchFieldsConfig;
}
```

默认行为：

- `title`、`description`、`excerpt`、`tags` 和 `categories` 默认开启；
- `content` 默认关闭，避免构建产物和客户端加载体积无上限增长；
- `maxContentLength` 至少为 0，全文开启时截断 Markdown 清洗后的纯文本；
- `maxResults` 默认 20，`minQueryLength` 默认 1；
- `routePrefix` 默认 `search`，由 core 负责默认值归一化。

## 5. 数据契约与虚拟模块

```ts
interface SearchDocument {
  id: string;
  title: string;
  route: string;
  url: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  content?: string;
  createDate: string;
  updateDate: string;
  image?: string;
  imageAlt?: string;
}
```

```ts
declare module 'virtual-search-data' {
  export const searchConfig: SearchConfig;
  export const searchDocuments: SearchDocument[];
  export const searchIndexHash: string;
}
```

`id` 使用文章 route，确保同一篇文章在文章列表、标签页和搜索结果之间可以相互关联。`url` 保留带站点路由前缀的运行时地址，主题仍需基于 `siteData.base` 生成最终链接。

## 6. 构建数据流

```text
posts/*.md
    ↓
plugin-posts-frontmatter
    ↓
search 扩展读取正文、清洗 Markdown、限制索引字段
    ↓
virtual-search-data
    ↓
Lucid Search 布局 / 自定义主题搜索组件
```

一期建议复用 `getFrontmatterFromFile`，同时在 `plugin-posts-frontmatter` 增加一个可选的正文读取工具，避免 search 插件重复实现 frontmatter 解析。正文清洗应移除 frontmatter、代码围栏和 HTML 标签，但保留标题文本和段落内容。

## 7. 页面与主题契约

插件新增主题布局：

```ts
pageLayouts: {
  search: './layouts/Search.js',
}
```

页面路由：

| 路由 | 布局 | 说明 |
| --- | --- | --- |
| `/search` | `pageLayouts.search` | 搜索输入和结果列表 |

Lucid 一期实现：

- 搜索输入框和清空按钮；
- 空查询时展示使用提示或最新文章；
- 输入后按标题、摘要、标签、分类进行本地匹配；
- 结果展示标题、摘要、日期和标签；
- 结果链接统一拼接 `siteData.base`；
- 搜索页不修改 Rspress 默认 `Search Docs` 弹窗，避免接管内部虚拟模块。

## 8. 搜索算法选择

一期可以使用轻量的 Fuse.js：

- 构建期只输出 JSON 文档，不输出 Fuse 实例；
- 浏览器加载页面时创建 Fuse 实例；
- 标题权重最高，摘要和标签次之，分类最低；
- `includeContent` 开启时正文权重最低；
- 结果数量由 `maxResults` 截断。

如果索引规模增长到数千篇文章，应迁移到构建期生成倒排索引或 Web Worker，而不是继续把全部原文放入首屏 JavaScript。

## 9. 与现有架构的关系

### 9.1 与 blog-list 的关系

Search 应消费同一套路由和文章元数据，但不依赖 `plugin-blog-list` 的插件执行顺序。当前可以通过复用解析工具保持独立；长期应由 core 提供 `ContentBuildContext`，让 posts、blog-list、search、tags 和 sitemap 共享一次扫描结果。

### 9.2 与 Rspress 搜索的关系

Rspress 的 `virtual-search-*` 模块属于底层主题实现，Search 插件不覆盖、不修改其导出。这样可以保留默认文档搜索，同时提供 Cogita 面向博客文章的稳定数据 API。

### 9.3 与 SEO 和 sitemap 的关系

SEO 插件为 `/search` 生成普通页面元数据；sitemap 只收录 `/search` 入口，不收录带用户查询词的动态 URL。搜索结果页不应被当成一组静态文章页面重复收录。

## 10. 实施顺序与验收标准

1. 在 core/shared 增加 `SearchConfig` 和 `pageLayouts.search`；
2. 扩展 posts-frontmatter 的正文读取工具；
3. 创建 search 插件包和虚拟模块声明；
4. 实现字段选择、Markdown 清洗、索引截断和 hash 生成；
5. 接入 Lucid Search 布局；
6. 接入 SEO、sitemap 和 `site.base` 链接规范；
7. 增加索引字段、空查询、中文查询和异常正文的测试。

验收标准：

- 不配置 `search` 时现有站点输出不改变；
- 配置 search 后生成 `/search` 页面；
- 中文标题、标签和分类可以被检索；
- 开启全文索引时正文被限制在 `maxContentLength` 内；
- 代码块和 frontmatter 不污染搜索摘要；
- `/cogita/search.html` 及结果链接可访问；
- SEO 报告包含 `/search`，sitemap 只包含搜索入口；
- `pnpm run build:packages`、`pnpm --filter blog build`、`pnpm run check` 和测试全部通过。

## 11. 分支建议

当前 `codex/plugin-blog-list` 仍包含未提交的列表插件改动，不建议直接在该分支混入 Search 实现。建议先将 Blog List 当前工作区形成一个完整提交，再从最新 main 创建 `codex/plugin-search`，按本方案实施 Search 一期。
