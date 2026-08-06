# @cogita/plugin-collections

合集（Collection）插件，为 Cogita 博客提供有序系列文章管理、合集页面生成和导航功能。

## 功能特性

- **有序系列文章**：将多篇相关文章组织成有顺序的合集（类似书籍章节、课程课时）
- **自动页面生成**：自动生成合集索引页和合集详情页
- **文章页合集导航**：在文章详情页显示"本文是合集 X 的第 N 篇"及上下篇导航
- **虚拟模块**：通过 `virtual-collections-data` 暴露合集数据和辅助函数
- **元数据覆盖**：支持在配置中为合集设置自定义标题、描述和封面
- **零配置开箱即用**：文章 frontmatter 只需声明 `collection` 和 `order` 字段

## 安装

该插件作为 `@cogita/theme-lucid` 的依赖自动安装，无需手动安装。

## 配置

在 `cogita.config.ts` 中配置：

```typescript
export default defineConfig({
  collections: {
    enabled: true,
    routePrefix: 'collections',
    metadata: {
      'react-hooks-series': {
        title: 'React Hooks 深入系列',
        description: '从入门到精通，系统掌握 React Hooks',
      },
    },
    minPostCount: 1,
  },
  theme: 'lucid',
});
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用合集功能 |
| `routePrefix` | `string` | `'collections'` | 合集页面路由前缀 |
| `metadata` | `Record<string, CollectionMetadata>` | `{}` | 合集元数据覆盖（按 slug 索引） |
| `excludeCollections` | `string[]` | `[]` | 排除的合集 slug 列表 |
| `minPostCount` | `number` | `1` | 最小文章数阈值 |

## 文章 Frontmatter

在文章的 frontmatter 中声明合集归属：

```yaml
---
title: "React Hooks 入门"
collection: "react-hooks-series"
order: 1
collectionTitle: "React Hooks 实战指南"
---
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `collection` | `string` | 合集 slug，同一 slug 的文章归入同一合集 |
| `order` | `number` | 在合集中的排序序号（升序），未指定则按日期排序 |
| `collectionTitle` | `string` | 合集内该篇的自定义标题（可选，覆盖文章原标题） |

## 虚拟模块

插件通过 `addRuntimeModules` 暴露 `virtual-collections-data`：

```typescript
import {
  allCollections,
  collectionMap,
  collectionsConfig,
  collectionStats,
  getCollectionBySlug,
  getPostsByCollection,
  getCollectionByPostRoute,
} from 'virtual-collections-data';
```

## 许可证

MIT
