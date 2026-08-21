# @cogita/plugin-search

Cogita 的本地文章搜索索引插件。

## 能力

- 构建期扫描文章并生成搜索文档；
- 支持标题、描述、摘要、标签、分类和可选正文索引；
- 通过 `virtual-search-data` 向主题暴露稳定搜索数据；
- 支持正文长度限制和索引 hash；
- 可选派发隐私优先的搜索分析事件，不内置第三方服务；
- 兼容 `site.base` 子路径部署。

## 配置

```ts
export default defineConfig({
  search: {
    enabled: true,
    routePrefix: 'search',
    includeContent: false,
    maxResults: 20,
    minQueryLength: 1,
    analytics: {
      enabled: true,
      eventName: 'cogita:search',
      includeQuery: false,
      includeFilters: false,
    },
  },
});
```

启用搜索分析后，搜索页面会在输入停止 300 毫秒后派发同名 `CustomEvent`，并在页面存在 `window.dataLayer` 时追加同一份事件对象。插件不会主动发起网络请求，站点可以自行接入 GA、Plausible、Umami 或其他统计服务。原始关键词和筛选条件默认不进入事件，需要显式打开 `includeQuery` 或 `includeFilters`。

事件对象包含 `event`、`resultCount`、`queryLength` 和 `indexHash`；启用对应配置后还会包含 `query` 或 `filters` 字段。

主题需要声明 `pageLayouts.search`。Lucid 主题会自动加载 `pluginSearch` 并提供搜索页面。

## 虚拟模块

插件提供 `virtual-search-data`，包含 `searchConfig`、`searchDocuments` 和 `searchIndexHash`。插件不会覆盖 Rspress 内部的 `virtual-search-*` 模块。
