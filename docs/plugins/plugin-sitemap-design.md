# 站点地图插件架构设计

## 目标

`@cogita/plugin-sitemap` 在静态构建阶段生成标准的 `sitemap.xml`，帮助搜索引擎发现站点首页、文章页面和用户配置的其他公开路由。

插件只负责构建期数据收集和 XML 输出，不引入运行时虚拟模块，也不修改主题页面渲染。站点地图的绝对地址由 `site.url` 与 `site.base` 共同决定。

## 配置

```ts
export default defineConfig({
  site: {
    url: 'https://example.com/blog/',
    base: '/blog/',
  },
  sitemap: {
    enabled: true,
    path: 'sitemap.xml',
    includeHome: true,
    includePosts: true,
    changefreq: 'weekly',
    priority: 0.7,
    customUrls: [{ path: '/about', priority: 0.5 }],
  },
});
```

没有 `sitemap` 配置时插件返回 `null`，不改变现有零配置行为。配置启用后，如果没有 `site.url`，默认跟随 `strict` 让构建失败；非严格模式下只警告并跳过生成。

## 构建流程

```text
Cogita 配置
    ↓
core 归一化 sitemap 配置
    ↓
beforeBuild：扫描文章 frontmatter，生成绝对 URL 和 lastmod
    ↓
Rspress 构建 HTML
    ↓
afterBuild：写入 doc_build/sitemap.xml
```

文章扫描暂时复用 `@cogita/plugin-posts-frontmatter` 的纯函数和路由约定。由于 Rspress 插件的 `beforeBuild` 生命周期并行执行，站点地图不读取 `virtual-posts-data`，避免隐式依赖另一个插件的执行顺序。

## URL 规则

- `site.url` 提供域名和可能已有的部署路径。
- `site.base` 在 `site.url` 未包含部署路径时补充到 URL 中。
- 文章路由来自 `posts.routePrefix` 和文章文件路径。
- 自定义地址既支持 `/about` 这类站点路由，也支持完整的 HTTP(S) 地址。
- 所有地址按 `loc` 去重并稳定排序。

## 输出和安全边界

- 输出路径默认是构建目录下的 `sitemap.xml`。
- 禁止通过 `path` 跳出构建输出目录。
- XML 文本使用统一转义，防止 URL 查询参数或自定义地址破坏 XML。
- `lastmod` 只输出可解析的日期。
- `priority` 会限制在 0 到 1 之间。

## 后续演进

第一期不包含图片站点地图、多语言索引和 sitemap index。后续 SEO 插件可以复用站点地图的规范化 URL 工具；当 core 引入 `ContentIndex` 后，站点地图应直接读取统一文章索引，消除与 tags、collections、rss、images 的重复扫描。
