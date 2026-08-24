# 内容质量与构建诊断插件

`@cogita/plugin-content-check` 在构建阶段复用 Cogita 的共享 `ContentIndex`，集中检查文章内容质量，并将结果输出到终端或 JSON 报告。

## 启用方式

主题会声明该插件，但插件只有在配置 `contentCheck` 后才会启用：

```ts
export default defineConfig({
  contentCheck: {
    enabled: true,
    reportPath: 'content-report.json',
    failOnError: false,
    requiredFields: ['title', 'date'],
    checkImages: true,
    checkImageAlt: true,
    checkRoutes: true,
    checkEmptyContent: true,
    checkLinks: true,
    severity: {
      'missing-link': 'warning',
    },
    ignores: [{ code: 'missing-link', route: '/posts/legacy' }],
  },
});
```

第一期支持以下检查：

- 必填 `title`、`description`、`date`、`author`、`imageAlt` 字段；
- 文章路由重复；
- 文章中的本地 Markdown、文章路由和公共资源链接；
- 文章封面和正文中的本地图片是否存在；
- 封面和正文图片是否有替代文本；
- 正文是否为空。

默认情况下问题只会输出为错误或警告，不会阻断构建。CI 中可以设置 `failOnError: true`，将错误纳入构建门禁。`reportPath` 相对于构建输出目录，报告中包含文章数量、问题数量、问题代码、路由和源文件路径。报告会在诊断完成后先写入一次，即使后续因为错误阻断构建，也尽量保留报告。

`severity` 用于按问题代码覆盖默认级别，支持 `error`、`warning` 和 `ignore`。`ignores` 支持按 `code`、`route`、`filePath` 精确或路径后缀匹配，适合处理历史文章的已知问题。报告包含 `schemaVersion: 1`，后续可以在不破坏消费方的情况下演进报告格式。

插件还会独立扫描文章源文件，捕获共享内容索引因 Frontmatter 解析失败而跳过的文件。插件只负责构建期诊断，不向浏览器注入运行时代码，也不把检查逻辑放进主题布局，因此可以由不同主题复用。
