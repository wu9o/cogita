# @cogita/plugin-sitemap

为 Cogita 在构建阶段生成 XML 站点地图。

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

构建完成后，站点地图默认写入构建输出目录的 `sitemap.xml`。文章地址来自 `posts` 配置和文章 frontmatter，`updateDate` 会转换为 `lastmod`。

`site.url` 是生成绝对地址的必要配置。默认情况下缺少它会让严格构建失败；在 `strict: false` 或 `failOnMissingSiteUrl: false` 时会警告并跳过生成。
