---
title: Content quality and build diagnostics
---

# Content quality and build diagnostics

`@cogita/plugin-content-check` reuses Cogita's shared `ContentIndex` at build time to check posts and ordinary documents, then writes diagnostics to the terminal or a JSON report.

## Enable the plugin

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

The checks cover required fields, duplicate routes, local links and assets, image existence and alt text, and empty bodies. By default, issues are reported without blocking the build. CI can set `failOnError: true` to make errors a build gate. `reportPath` is relative to the build output and the report includes item counts, issue codes, routes, and source paths.

`severity` overrides the default level with `error`, `warning`, or `ignore`. `ignores` can match `code`, `route`, or `filePath` exactly or by path suffix. Reports use `schemaVersion: 1` and retain `postCount` for older consumers.

## Shared reports and boundary

Content reports and SEO audit reports share `reportType`, `itemCount`, `errors`, `warnings`, and `issues`:

```bash
node scripts/check-quality-reports.mjs \
  --report doc_build/content-report.json \
  --report doc_build/seo-report.json \
  --max-errors 0 \
  --max-warnings 0
```

Thresholds can also come from `COGITA_QUALITY_MAX_ERRORS` and `COGITA_QUALITY_MAX_WARNINGS`. The plugin independently scans source files to catch files skipped when shared frontmatter parsing fails. It performs build-time diagnostics only and injects no browser runtime code.

For the Chinese version, see [内容质量与构建诊断插件](../zh-CN/plugins/plugin-content-check-design.html).
