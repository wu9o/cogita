---
title: 内容质量与构建诊断插件
---

# 内容质量与构建诊断插件

`@cogita/plugin-content-check` 在构建阶段复用 Cogita 的共享 `ContentIndex`，集中检查文章和普通文档，并将结果输出到终端或 JSON 报告。

## 启用方式

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
    severity: { 'missing-link': 'warning' },
    ignores: [{ code: 'missing-link', route: '/posts/legacy' }],
  },
});
```

检查包括必填字段、重复路由、本地链接和资源、图片存在性与替代文本，以及空正文。默认只输出错误和警告；CI 可以通过 `failOnError: true` 将错误纳入构建门禁。`reportPath` 相对于构建输出目录，报告包含条目数、问题代码、路由和源文件路径。

`severity` 支持 `error`、`warning` 和 `ignore`；`ignores` 支持按 `code`、`route`、`filePath` 精确或路径后缀匹配。报告使用 `schemaVersion: 1`，并保留 `postCount` 兼容旧消费者。

## 统一报告与边界

内容报告与 SEO 审核报告共享 `reportType`、`itemCount`、`errors`、`warnings` 和 `issues` 字段，可交给：

```bash
node scripts/check-quality-reports.mjs \
  --report doc_build/content-report.json \
  --report doc_build/seo-report.json \
  --max-errors 0 \
  --max-warnings 0
```

错误和警告阈值也可以通过 `COGITA_QUALITY_MAX_ERRORS` 与 `COGITA_QUALITY_MAX_WARNINGS` 配置。插件还会独立扫描源文件，捕获 Frontmatter 解析失败而未进入共享索引的文件。它只负责构建期诊断，不注入浏览器运行时代码。
