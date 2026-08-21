# @cogita/plugin-seo

为 Cogita 生成页面级 SEO 元数据、Open Graph、Twitter Card 和 JSON-LD 结构化数据。

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

文章可以通过 `seo` frontmatter 覆盖默认值：

```yaml
seo:
  title: 自定义分享标题
  description: 自定义搜索摘要
  canonical: /posts/custom-canonical
  image: /images/custom-card.png
  imageAlt: 分享卡片说明
  noindex: false
```

插件使用 Rspress 的 `head` 配置钩子生成静态 HTML 标签，不增加浏览器运行时依赖。没有 `seo` 配置时插件不会改变现有页面。

## SEO 审核

开启 `audit.enabled` 后，插件会在构建阶段检查首页和文章页的标题、描述、canonical、分享图片替代文本和作者信息：

- 默认只输出中文告警，不影响构建；
- `failOnError: true` 时，缺少标题、描述或 canonical 会阻断构建；
- 配置 `reportPath` 后，会在构建输出目录写入结构化的 `seo-report.json`；
- `minDescriptionLength` 可调整描述过短的告警阈值，默认值为 50。
