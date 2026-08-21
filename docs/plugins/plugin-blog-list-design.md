# Blog List 插件架构设计与实现方案

**文档版本**：1.0
**创建日期**：2026 年 8 月 21 日
**插件名称**：`@cogita/plugin-blog-list`
**状态**：第一期已实现，后续筛选能力待建设

## 1. 建设目标

Blog List 是 Cogita 的文章列表与归档能力插件，负责把文章数据组织成可浏览、可分页、可扩展的静态页面。

当前 Lucid 首页直接消费 `virtual-posts-data` 中的全部文章，已经可以展示最新文章，但仍存在几个明显边界：

- 文章数量增长后，首页没有分页，首屏和 HTML 体积会持续变大；
- 没有独立的归档入口，用户只能从首页或标签页发现文章；
- 标签、合集和未来搜索各自消费文章数据，缺少统一的列表语义；
- 列表排序、分页和归档规则目前属于主题内联逻辑，其他主题无法复用。

本插件的第一目标不是重新扫描文章，而是提供一套主题无关的“文章列表数据 + 静态列表页面”能力。

## 2. 设计原则

1. **插件负责数据和页面路由，主题负责视觉呈现**：插件不写 JSX，不把 Lucid 的布局逻辑下沉到核心。
2. **保持现有插件工厂模式**：配置缺失或明确禁用时返回 `null`，不影响已有站点构建。
3. **复用文章数据契约**：优先沿用 `PostFrontmatter` 和 `Post`，不再定义一套不兼容的文章模型。
4. **静态优先**：分页和归档在构建期生成，避免依赖客户端路由和运行时查询参数。
5. **渐进式增强**：第一期只实现列表、分页和按年归档；标签、分类过滤和搜索索引作为后续扩展。
6. **部署路径安全**：所有主题内生成的链接都必须基于 `site.base`，兼容 `/cogita/` 这类子路径部署。

## 3. 功能范围

### 第一期：列表基础能力

- 生成文章列表页，默认路由为 `/archive`；
- 支持页码和可配置的每页文章数量；
- 支持按创建时间或更新时间排序；
- 支持升序、降序和稳定的日期相同兜底排序；
- 生成按年份分组的归档页；
- 输出统一的 `virtual-blog-list-data` 虚拟模块；
- 为主题提供 `pageLayouts.blogList` 和 `pageLayouts.archive` 布局入口；
- 与现有图片封面、标签、合集和 SEO 元数据兼容。

### 第二期：内容筛选能力

- 标签筛选静态页；
- 分类筛选静态页；
- 月度归档；
- 自定义列表页面和过滤器；
- 分页导航组件和列表空状态组件沉淀到 `@cogita/ui`。

### 暂不纳入

- 客户端全文搜索；
- 服务端分页或 API；
- 草稿和登录态内容；
- 图片压缩和格式转换；
- 评论、分析等独立业务能力。

## 4. 配置设计

配置放在 `config.blogList` 命名空间中：

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

建议类型：

```ts
type BlogListSortBy = 'createDate' | 'updateDate' | 'title';
type BlogListOrder = 'asc' | 'desc';
type ArchiveGranularity = 'year' | 'month';

interface BlogListConfig {
  enabled?: boolean;
  routePrefix?: string;
  pageSize?: number;
  sortBy?: BlogListSortBy;
  order?: BlogListOrder;
  generateArchives?: boolean;
  archivePrefix?: string;
  archiveGranularity?: ArchiveGranularity;
}
```

默认值应集中在 `@cogita/core` 的增强配置中，插件内部只负责最终校验：`pageSize` 至少为 1，路由前缀不能包含前导 `/`，未知排序字段回退到 `createDate`。

## 5. 数据流和虚拟模块

```text
posts/*.md
    ↓
PostFrontmatter
    ↓
blog-list 规范化、排序、分页、分组
    ↓
virtual-blog-list-data
    ↓
主题 BlogList / Archive 布局
```

虚拟模块建议暴露以下数据：

```ts
interface BlogListPage {
  page: number;
  totalPages: number;
  posts: Post[];
  route: string;
  previous?: string;
  next?: string;
}

interface BlogArchive {
  key: string;
  label: string;
  count: number;
  posts: Post[];
  route: string;
}
```

```ts
declare module 'virtual-blog-list-data' {
  export const blogListConfig: BlogListConfig;
  export const allBlogListPages: BlogListPage[];
  export const allArchives: BlogArchive[];
  export function getBlogListPage(page: number): BlogListPage | undefined;
  export function getArchive(key: string): BlogArchive | undefined;
}
```

列表数据应保留图片插件补充的 `imageAlt`、`imageCaption`、`imageWidth` 和 `imageHeight`，使主题可以直接复用现有 `PostList` 和封面组件。

## 6. 页面路由与主题契约

第一期建议生成：

| 路由 | 布局 | 说明 |
| --- | --- | --- |
| `/archive` | `pageLayouts.blogList` | 第一页文章列表 |
| `/archive/page/2` | `pageLayouts.blogList` | 后续分页 |
| `/archives` | `pageLayouts.archive` | 归档入口 |
| `/archives/2026` | `pageLayouts.archive` | 年度归档 |

页面通过 `config.themeLayouts` 获取主题布局绝对路径，处理方式与 tags、collections 插件保持一致。主题布局从 `window.location.pathname` 解析当前页码或归档 key，静态页面只负责选择已生成的数据，不在浏览器中重新计算。

Lucid 第一期开启方式：

- 新增 `BlogList.tsx`，复用 `PostList`、`PostCover` 和标签展示；
- 新增 `Archive.tsx`，复用同一个列表渲染基础；
- 在首页保留现有“最新文章”体验，并增加“查看全部文章”入口；
- 增加分页导航、归档导航和空状态；
- 所有链接统一拼接 `siteData.base`。

## 7. 插件实现边界

插件目录建议为：

```text
plugins/blog-list/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   ├── types.ts
│   ├── utils.ts
│   └── client.d.ts
├── README.md
├── package.json
├── rslib.config.ts
└── tsconfig.json
```

插件生命周期职责：

- `beforeBuild`：获取文章数据，完成规范化、排序、分页和归档分组；
- `addPages`：根据主题布局生成列表页和归档页；
- `addRuntimeModules`：生成 `virtual-blog-list-data`；
- 不修改 Rspress 全局 HTML，不负责 SEO meta；SEO 继续由 `plugin-seo` 处理。

## 8. 现有架构问题与处理策略

当前 tags、collections、images、sitemap 和 seo 都可能重复读取文章 frontmatter。原因是 Rspress 插件之间目前没有公开的构建上下文或共享数据服务，运行时虚拟模块也不能直接作为另一个插件的构建期输入。

本插件第一期采用以下策略：

1. 复用 `@cogita/plugin-posts-frontmatter` 暴露的解析工具和同一套路由规则；
2. 不依赖某个插件先执行 `beforeBuild` 后再读取其内存变量；
3. 把排序、分页和归档算法写成纯函数，便于测试和未来迁移；
4. 记录后续架构任务：在 core 中增加一次扫描、多插件共享的 `ContentBuildContext`，逐步消除重复扫描。

这能保证当前主题体系可以立即落地，同时不把“插件执行顺序”变成隐式契约。

## 9. 实施顺序与验收标准

### 实施顺序

1. 增加 `BlogListConfig`、`BlogListPage` 和 `BlogArchive` 类型；
2. 创建插件包、构建配置、README 和虚拟模块声明；
3. 实现纯函数：排序、分页、日期分组、路由生成；
4. 接入 core 默认配置和 Lucid 主题插件列表；
5. 新增 Lucid 列表和归档布局；
6. 更新示例博客配置和文档；
7. 增加构建产物检查、异常配置检查和 base 路径检查。

### 验收标准

- 文章少于一页时只生成一个列表页，不生成空分页；
- 文章超过一页时每页数量准确，上一页/下一页链接正确；
- 年度归档只包含对应年份文章，日期非法时构建输出可诊断警告；
- 空文章目录仍能成功构建并展示空状态；
- `/cogita/` 子路径下所有列表、归档和文章链接可访问；
- 不配置 `blogList` 时，现有首页、标签、合集、RSS、sitemap 和 SEO 行为不改变；
- `pnpm run build:packages`、`pnpm --filter blog build`、`pnpm run test`、`pnpm exec biome check .` 全部通过。

## 10. 后续模块关系

```text
plugin-posts-frontmatter
          ↓
    plugin-blog-list
       ↙       ↘
plugin-categories  plugin-search
```

Blog List 完成后，搜索插件可以直接复用规范化的文章索引；分类插件可以复用列表页、分页和筛选模型。因此它是当前最适合继续建设的基础用户体验模块。
