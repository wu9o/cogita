---
title: 搜索插件设计
---

# 搜索插件设计

`@cogita/plugin-search` 提供可复用的本地内容搜索索引和 `/search` 页面。它建立在共享 `ContentIndex` 之上，不替换 Rspress 默认的文档搜索。

## 目标与边界

- 构建期生成标准化搜索文档，浏览器运行时执行查询；
- 默认索引标题、摘要、标签和分类，正文需显式开启；
- 主题负责输入框、结果卡片和交互样式；
- 保留 Rspress 搜索弹窗，不覆盖其内部虚拟模块；
- 分析事件默认关闭，不主动向第三方服务发送数据。

一期不实现服务端搜索、外部搜索服务、结果分页和复杂布尔查询。

## 配置

```ts
export default defineConfig({
  search: {
    enabled: true,
    routePrefix: 'search',
    includeContent: true,
    maxContentLength: 12_000,
    maxResults: 20,
    fields: {
      title: true,
      description: true,
      tags: true,
      categories: true,
      content: true,
    },
  },
});
```

`analytics.enabled` 默认关闭；若显式开启，查询词和筛选条件仍需分别授权，默认不进入事件。

## 数据契约

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

`virtual-search-data` 暴露 `searchConfig`、`searchDocuments` 和 `searchIndexHash`。`id` 使用文章 route，保证文章列表、分类和搜索结果可以互相关联。

## 页面与主题

插件新增 `/search` 页面和 `pageLayouts.search` 布局。Lucid 主题支持关键词高亮、标签和分类筛选、`q`/`tag`/`category` URL 参数、空查询提示和 `site.base` 子路径部署。

正文索引会先移除 frontmatter、代码围栏和 HTML 标签，再按 `maxContentLength` 截断并生成上下文摘要。高亮文本必须以安全的 React 节点渲染。

## 架构关系

Search、blog-list、tags、categories 和 sitemap 应共享同一内容索引和路由规则。搜索只提供索引和页面，不负责主题布局或独立内容扫描。

## 验收

- 未配置搜索时现有站点输出不改变；
- 配置后生成 `/search`，中文标题、标签和分类可检索；
- 正文长度受配置限制，摘要不包含 frontmatter 和代码块；
- `/cogita/search.html` 及结果链接可访问；
- SEO 收录搜索入口，sitemap 不收录动态查询 URL；
- 搜索分析无网络副作用，且 `site.base` 下链接正确。

详见[内容索引设计](../api/content-index-design.html)和[插件 API 规范](./plugin-api-specification.html)。
