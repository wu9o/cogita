---
title: 内容质量与构建诊断插件
---

# 内容质量与构建诊断插件

`@cogita/plugin-content-check` 在构建阶段复用 Cogita 的共享 `ContentIndex`，集中检查文章和普通文档的内容质量，并将结果输出到终端或 JSON 报告。

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
- 内容条目路由重复；
- 文章或普通文档中的本地 Markdown、内容路由和公共资源链接；
- 内容封面和正文中的本地图片是否存在；
- 封面和正文图片是否有替代文本；
- 正文是否为空。

默认情况下问题只会输出为错误或警告，不会阻断构建。CI 中可以设置 `failOnError: true`，将错误纳入构建门禁。`reportPath` 相对于构建输出目录，报告中包含文章数量、问题数量、问题代码、路由和源文件路径。报告会在诊断完成后先写入一次，即使后续因为错误阻断构建，也尽量保留报告。

`severity` 用于按问题代码覆盖默认级别，支持 `error`、`warning` 和 `ignore`。`ignores` 支持按 `code`、`route`、`filePath` 精确或路径后缀匹配，适合处理历史文章的已知问题。报告包含 `schemaVersion: 1`，后续可以在不破坏消费方的情况下演进报告格式。

## 统一报告与 CI 门禁

内容报告和 SEO 审核报告共享同一套稳定字段：

```json
{
  "schemaVersion": 1,
  "reportType": "content-check",
  "generatedAt": "2026-08-26T00:00:00.000Z",
  "itemCount": 12,
  "errors": 0,
  "warnings": 1,
  "issues": [
    {
      "severity": "warning",
      "code": "missing-link",
      "route": "/posts/example",
      "filePath": "posts/example.md",
      "message": "找不到本地链接目标：./missing.md"
    }
  ]
}
```

`reportType` 为 `content-check` 或 `seo-audit`，`itemCount` 表示文章或普通文档数量。旧版消费者仍可读取 `postCount` 或 `pageCount`，但新的 CI 工具应优先使用统一字段。为兼容旧报告，插件仍会保留 `postCount` 字段，但在统一索引模式下它表示全部内容条目数量。

在构建后执行统一门禁：

```bash
node scripts/check-quality-reports.mjs \
  --report doc_build/content-report.json \
  --report doc_build/seo-report.json \
  --max-errors 0 \
  --max-warnings 0
```

错误阈值默认是 `0`，警告默认不阻断；也可以通过 `COGITA_QUALITY_MAX_ERRORS` 和 `COGITA_QUALITY_MAX_WARNINGS` 配置。运行在 GitHub Actions 时会自动输出 `::error`/`::warning` annotation，也可以用 `--annotations always` 或 `--no-annotations` 显式控制。真实博客发布检查会同时验证两份报告和构建产物。

插件还会独立扫描文章和普通文档源文件，捕获共享内容索引因 Frontmatter 解析失败而跳过的文件。Knowledge 主题默认声明该插件，但只有站点显式配置 `contentCheck` 时才执行检查。插件只负责构建期诊断，不向浏览器注入运行时代码，也不把检查逻辑放进主题布局，因此可以由不同主题复用。
