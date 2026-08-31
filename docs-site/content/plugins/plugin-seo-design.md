# SEO 插件架构设计

## 目标

`@cogita/plugin-seo` 在构建阶段为首页、文章页和其他已生成路由注入页面级 SEO 元数据，补齐站点地图之后的页面描述和社交分享能力。

第一期不增加客户端运行时组件，不修改文章正文渲染，只生成静态 HTML 的 head 标签。

## 配置

```ts
export default defineConfig({
  site: {
    title: '我的博客',
    description: '记录技术和思考',
    url: 'https://example.com/blog/',
    base: '/blog/',
  },
  seo: {
    enabled: true,
    defaultImage: '/images/social-card.png',
    defaultImageAlt: '站点默认分享图片',
    author: '作者名称',
    twitterCard: 'summary_large_image',
    twitterSite: '@example',
    twitterCreator: '@author',
    includeJsonLd: true,
    audit: {
      enabled: true,
      reportPath: 'seo-report.json',
      failOnError: false,
    },
  },
});
```

没有 `seo` 配置时插件返回 `null`，不会改变已有 HTML。启用后，Rspress 原来的静态 description 由插件替换为页面级 description。

## 文章覆盖字段

文章可以使用嵌套的 `seo` frontmatter 覆盖默认元数据：

```yaml
seo:
  title: 自定义分享标题
  description: 自定义搜索摘要
  canonical: /posts/custom-canonical
  image: /images/custom-card.png
  imageAlt: 分享卡片说明
  noindex: false
  author: 作者名称
```

文章已有的 `title`、`description`、`excerpt`、`image`、`imageAlt`、`author` 字段仍然有效。覆盖优先级为：`seo` 嵌套字段 → 文章普通字段 → 站点级默认值。

## 构建流程

```text
Cogita 配置
    ↓
core 归一化 seo 配置
    ↓
SEO 插件 config 钩子扫描文章 frontmatter
    ↓
Rspress config.head 按 routePath 注入静态标签
    ↓
生成 HTML、Open Graph、Twitter Card 和 JSON-LD
```

Rspress 1.45 提供了 `config.head` 的路由回调能力，因此插件可以按页面生成标签，不需要修改 HTML 文件，也不依赖运行时虚拟模块。

## SEO 审核流程

审核工具复用插件在 `config` 钩子中收集的文章元数据，构造首页和文章页的审核页面集合，检查以下规则：

- 标题、描述和 canonical 必须存在；
- 描述过短时输出警告，默认阈值为 50 个字符；
- 分享图片存在时必须有 `imageAlt`；
- 文章建议配置作者信息。

审核默认只输出报告，不阻断构建。设置 `audit.failOnError: true` 后，缺少标题、描述或 canonical 会让构建失败。设置 `audit.reportPath` 后，报告会以 JSON 写入构建输出目录，便于 CI 或后续工具继续处理。

SEO 审核报告遵循统一质量报告 schema，除兼容保留的 `pageCount` 外，还包含 `reportType: "seo-audit"` 和通用的 `itemCount`、`errors`、`warnings`、`issues` 字段。它可以和 `content-report.json` 一起交给 `scripts/check-quality-reports.mjs`，由同一个门禁统计总错误和警告，并在 GitHub Actions 中生成逐条 annotation。

## 生成内容

文章页包含：

- `description` 和 `robots`
- `canonical`、`og:url`
- `og:type`、`og:title`、`og:description`、`og:image`
- `twitter:card`、`twitter:title`、`twitter:description`、`twitter:image`
- `author`
- Article JSON-LD

首页使用 WebSite JSON-LD，其他页面使用站点默认元数据。`site.base` 会参与绝对 URL 计算，外部图片地址不会被重复拼接。

## 架构边界

SEO 插件通过 `config` 钩子注册页面 head，通过 `beforeBuild` 使用 core 提供的 `ContentIndex` 生成页面元数据；这样索引失效发生在 SEO 重新读取文章之前，不依赖 posts 插件的执行顺序。旧版 core 或插件单独使用时仍保留独立扫描兜底。

搜索功能暂不在 SEO 插件中重复实现：Rspress 已经生成本地搜索索引和搜索入口，未来只需在现有索引上扩展标签、合集和搜索权重。
