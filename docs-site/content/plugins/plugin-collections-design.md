# 合集插件架构设计与实现方案

**文档版本**: 1.0  
**创建日期**: 2026年8月  
**插件名称**: `@cogita/plugin-collections`  
**依赖**: `@cogita/plugin-posts-frontmatter`  
**参考**: `@cogita/plugin-tags`（架构模式高度一致）

## 概述

合集（Collection）是 Cogita 博客系统中用于将多篇相关文章组织成**有序系列**的功能。与标签（Tags）的扁平、无序、多对多不同，合集强调**顺序性**和**系列感**——类似书籍的章节、课程的课时、或播放列表。

### 核心区别：合集 vs 标签

| 维度 | 标签 Tags | 合集 Collections |
|------|----------|-----------------|
| 关系模型 | 多对多（一篇文章多个标签） | 一对多（一篇文章归属一个合集） |
| 排序 | 无序 | 有序（按 `order` 字段） |
| 数据来源 | frontmatter `tags` 数组 | frontmatter `collection` + `order` |
| 页面焦点 | 按标签筛选文章 | 按系列顺序阅读 |
| 导航需求 | 无上下篇导航 | 需要「上一篇 / 下一篇」 |
| 元数据 | 无（标签即名称） | 有（标题、描述、封面） |

## 架构设计

### 数据流

```
文章 frontmatter → 合集提取器 → 虚拟模块 → 主题组件渲染
     ↓                ↓           ↓            ↓
collection字段    分组+排序    virtual-     CollectionLayout
+ order字段       生成CollectionData  collections-data  CollectionList
```

### 插件结构

```
plugins/collections/
├── src/
│   ├── index.ts          # 插件入口，导出 pluginCollections
│   ├── plugin.ts         # 插件工厂主逻辑
│   ├── types.ts          # 类型定义（CollectionData, CollectionsConfig 等）
│   ├── utils.ts          # 合集提取、排序、统计工具函数
│   └── client.d.ts       # 虚拟模块类型声明
├── package.json
└── README.md
```

### 核心类型定义

```typescript
/**
 * 合集数据结构
 */
export interface CollectionData {
  /** 合集 slug（URL 标识） */
  slug: string;
  /** 合集标题（来自配置或从 slug 生成） */
  title: string;
  /** 合集描述 */
  description?: string;
  /** 封面图片路径 */
  cover?: string;
  /** 合集内的文章列表（已按 order 排序） */
  posts: CollectionPost[];
  /** 文章数量 */
  count: number;
  /** 合集页面路由 */
  route: string;
  /** 合集创建时间（首篇文章日期） */
  createdDate?: string;
  /** 合集更新时间（末篇文章日期） */
  updatedDate?: string;
}

/**
 * 合集内的文章引用（比 PostReference 多 order 字段）
 */
export interface CollectionPost {
  title: string;
  route: string;
  createDate: string;
  updateDate: string;
  description?: string;
  /** 在合集中的序号（从 1 开始） */
  order: number;
  /** 合集内的自定义标题（可选，覆盖文章原标题） */
  collectionTitle?: string;
}

/**
 * 合集插件配置
 */
export interface CollectionsConfig {
  /** 是否启用，默认 true */
  enabled?: boolean;
  /** 路由前缀，默认 'collections' */
  routePrefix?: string;
  /** 合集元数据覆盖（按 slug 索引） */
  metadata?: Record<string, CollectionMetadata>;
  /** 排除的合集 slug 列表 */
  excludeCollections?: string[];
  /** 最小文章数阈值，默认 1 */
  minPostCount?: number;
}

/**
 * 合集元数据（用户在配置中声明）
 */
export interface CollectionMetadata {
  title?: string;
  description?: string;
  cover?: string;
}
```

### 文章 Frontmatter 声明方式

```yaml
---
title: "React Hooks 入门"
date: "2026-01-01"
collection: "react-hooks-series"
order: 1
---

# React Hooks 入门
...
```

**字段说明：**

- `collection`：合集 slug。同一 slug 的文章归入同一合集。
- `order`：在合集中的排序序号（数字，升序）。未指定则按文章日期排序。
- `collectionTitle`（可选）：合集内该篇的自定义标题，不指定则用文章 `title`。

### 虚拟模块

插件通过 `addRuntimeModules` 暴露 `virtual-collections-data`：

```typescript
declare module 'virtual-collections-data' {
  export const allCollections: CollectionData[];
  export const collectionMap: Record<string, CollectionData>;
  export const collectionsConfig: CollectionsConfig;

  export function getCollectionBySlug(slug: string): CollectionData | undefined;
  export function getPostsByCollection(slug: string): CollectionPost[];
  export function getCollectionByPostRoute(route: string): CollectionData | undefined;
  export function getCollectionStats(): CollectionStats;
}
```

**关键函数：**

- `getCollectionByPostRoute(route)` — 给定文章路由，返回它所属的合集（用于文章页显示合集导航）
- `getCollectionStats()` — 合集统计（总数、最大合集、平均文章数等）

### 页面生成

插件通过 `addPages` 生成以下页面（使用主题 React 布局组件）：

| 路由 | 布局 | 内容 |
|------|------|------|
| `/collections` | `pageLayouts.collectionIndex` | 合集列表页：所有合集卡片 |
| `/collections/:slug` | `pageLayouts.collection` | 合集详情页：有序文章列表 + 导航 |

> **注意**：与 tags 插件一致，合集页面使用 React 组件布局。主题需在 `getThemeConfig()` 中声明 `pageLayouts.collection` 和 `pageLayouts.collectionIndex`。

### 主题集成

#### CogitaTheme 扩展

```typescript
// shared/src/index.ts — CogitaTheme.pageLayouts 增加：
pageLayouts: {
  home: string;
  tag?: string;
  tagIndex?: string;
  collection?: string;        // 合集详情页布局
  collectionIndex?: string;   // 合集索引页布局
};
```

#### 主题布局组件（lucid 示例）

```tsx
// themes/lucid/src/layouts/Collection.tsx
const CollectionLayout: React.FC<LayoutProps> = () => {
  const pathname = decodeURIComponent(window.location.pathname);
  const slug = pathname.split('/collections/')[1]?.replace(/\.html$/, '') || '';

  if (!slug) {
    // 索引页：所有合集卡片
    return <CollectionList collections={allCollections} />;
  }

  // 详情页：有序文章列表
  const collection = getCollectionBySlug(slug);
  if (!collection) return <NotFound />;

  return (
    <div className="collection-page">
      <CollectionHeader collection={collection} />
      <OrderedPostList posts={collection.posts} />
      <CollectionNav collection={collection} currentRoute={pathname} />
    </div>
  );
};
```

### UI 组件

新增到 `@cogita/ui`：

| 组件 | 用途 | Props |
|------|------|-------|
| `CollectionList` | 合集卡片列表（索引页 + 首页侧边栏） | `collections`, `variant` ('card' \| 'compact') |
| `OrderedPostList` | 有序文章列表（带序号） | `posts: CollectionPost[]` |
| `CollectionNav` | 上一篇/下一篇导航 | `collection`, `currentRoute` |
| `CollectionProgress` | 阅读进度指示器 | `current`, `total` |

### 首页侧边栏集成

Home.tsx 的合集占位区替换为 `CollectionList` compact 变体：

```tsx
<aside className="home-sidebar">
  <section className="sidebar-section">
    <h2 className="sidebar-title">标签</h2>
    <TagCloud tags={allTags} config={tagsConfig.tagCloud} />
  </section>
  <section className="sidebar-section">
    <h2 className="sidebar-title">合集</h2>
    <CollectionList collections={allCollections} variant="compact" limit={5} />
  </section>
</aside>
```

## 配置示例

### 基础配置（零配置开箱即用）

```typescript
// cogita.config.ts
export default defineConfig({
  collections: { enabled: true },
  theme: '@cogita/theme-lucid',  // 主题自动加载 collections 插件
});
```

文章 frontmatter 只需声明 `collection` 和 `order`，合集标题自动从 slug 生成。

### 完整配置（带元数据）

```typescript
export default defineConfig({
  collections: {
    enabled: true,
    routePrefix: 'series',  // 使用 /series/react-hooks 而非 /collections/react-hooks
    metadata: {
      'react-hooks-series': {
        title: 'React Hooks 深入系列',
        description: '从入门到精通，系统掌握 React Hooks',
        cover: '/images/covers/react-hooks.png',
      },
      'git-advanced': {
        title: 'Git 进阶技巧',
        description: 'Rebase、Cherry-pick、工作流实战',
      },
    },
    minPostCount: 2,  // 少于 2 篇的合集不显示
  },
});
```

### 文章声明示例

```yaml
# posts/react-hooks-01.md
---
title: "React Hooks 入门"
collection: "react-hooks-series"
order: 1
---

# posts/react-hooks-02.md
---
title: "useEffect 深入解析"
collection: "react-hooks-series"
order: 2
collectionTitle: "副作用与 Effect Hook"
---

# posts/react-hooks-03.md
---
title: "自定义 Hooks 模式"
collection: "react-hooks-series"
order: 3
---
```

## 与 tags 插件的架构对比

| 方面 | tags 插件 | collections 插件 |
|------|----------|-----------------|
| 数据提取 | `extractTagsFromPosts` | `extractCollectionsFromPosts` |
| 分组逻辑 | 按 tag name 分组 | 按 collection slug 分组 |
| 排序 | 无（或按 count） | 按 order 字段升序 |
| 虚拟模块 | `virtual-tags-data` | `virtual-collections-data` |
| 页面布局 | `pageLayouts.tag` | `pageLayouts.collection` |
| UI 组件 | TagCloud, TagList | CollectionList, OrderedPostList |
| 元数据来源 | 无 | config.metadata + 自动生成 |

## 实现计划与进度

### Phase 1：核心插件（MVP）✅ 已完成

1. ✅ `plugins/collections/` 脚手架（package.json, tsconfig, rslib.config）
2. ✅ `types.ts` — 类型定义
3. ✅ `utils.ts` — `extractCollectionsFromPosts`、`processCollectionsFromPosts`、`calculateCollectionStats`
4. ✅ `plugin.ts` — 工厂函数、`beforeBuild`、`addRuntimeModules`、`addPages`
5. ✅ `client.d.ts` — 虚拟模块类型声明
6. ✅ `shared/src/index.ts` — `CogitaTheme.pageLayouts` 增加 collection 字段
7. ✅ `core/src/node/config.ts` — `createFullConfig` 增加 collections 默认配置

### Phase 2：主题与 UI ✅ 已完成

1. ✅ `themes/lucid/src/layouts/Collection.tsx` — 合集页面布局（索引页 + 详情页双模式）
2. ✅ `themes/lucid/src/index.ts` — `pageLayouts` 声明 collection，注册 CollectionNav 全局组件
3. ✅ Home.tsx 侧边栏合集列表（内联实现，非 @cogita/ui 组件）
4. ✅ `themes/lucid/src/theme.css` — 合集页面样式 + 文章页合集导航样式 + 暗色模式

> **注意**：UI 组件（CollectionList、OrderedPostList、CollectionNav）未抽取到 `@cogita/ui`，而是在主题布局中内联实现。这是因为合集 UI 与主题视觉强绑定，抽取为通用组件的收益不大。如未来出现第二个主题，可再考虑抽取。

### Phase 3：增强功能（部分完成）

#### ✅ 已完成：文章页合集导航

- ✅ `themes/lucid/src/components/CollectionNav.tsx` — 全局 UI 组件
- ✅ 通过 `globalUIComponents` 注册，在所有页面加载
- ✅ 检测当前文章是否属于合集，显示合集归属信息 + 上下篇导航
- ✅ 支持暗色模式、响应式设计
- ✅ 修复了 `core/src/node/config.ts` 中 `globalUIComponents` 未传递的 bug

#### ✅ 已完成：CLI preview 命令

- ✅ `packages/core/src/node/preview.ts` — 新增 `createPreview` 函数
- ✅ `packages/cli/src/index.ts` — `preview` 命令实现（之前是 TODO）
- ✅ 支持 `--port` 参数

#### 📐 未实现：后续增强

- 📐 合集阅读进度持久化（localStorage）— 记录用户在合集内的阅读进度
- 📐 合集封面图自动生成 — 为合集生成 OG 图片
- 📐 合集 RSS 订阅 — 每个合集独立的 RSS feed

### Bug 修复（开发过程中发现并修复）

1. **`config.ts` globalUIComponents 未传递** — `createThemePlugin` 未将主题的 `globalUIComponents` 传递给 Rspress，导致全局组件不生效
2. **`config.ts` globalStyles 路径截断** — `theme.globalStyles?.[0]` 对字符串取字符索引（得到 `/`），改为 `theme.globalStyles`
3. **`Collection.tsx` 无效导航** — 合集详情页中 prev/next 导航用 `window.location.pathname` 匹配文章路由，但合集详情页 pathname 永远不匹配文章路由，导致导航永远不显示

## 设计决策记录

### D1：为什么用 frontmatter 而非目录结构？

用户提到合集是「文件夹的概念」。但目录结构方式有以下问题：
- 一篇文章只能在一个目录 → 无法跨合集
- 移动文章需要移动文件 → 不灵活
- 与现有 posts-frontmatter 插件的扁平扫描模式冲突

**决策**：用 frontmatter `collection` 字段声明归属，保持与 tags 插件一致的架构。目录结构可作为未来增强（自动推断 collection slug）。

### D2：为什么一篇文章只归属一个合集？

合集强调「系列感」和顺序阅读。一篇文章同时属于多个合集会破坏这种连贯性，也让导航逻辑复杂化。

**决策**：`collection` 字段为单个字符串。如需多合集，未来支持 `collections: ["a", "b"]` 数组形式。

### D3：order 字段 vs 日期排序？

`order` 字段显式可控，适合教程类系列。日期排序适合时间线类内容。

**决策**：优先用 `order` 字段；未指定 order 的文章按 `createDate` 升序排在末尾。

### D4：合集元数据放配置 vs 放文件？

配置方式（`cogita.config.ts` 的 `metadata`）集中管理，适合少量合集。文件方式（如 `collections/react-hooks.md`）分散管理，适合大量合集。

**决策**：v1 用配置方式。未来可支持在 posts 目录下放 `_collections/:slug.md` 文件声明元数据。
