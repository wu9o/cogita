# @cogita/plugin-content-check

Cogita 的内容质量与构建诊断插件，用于在静态构建阶段发现文章元数据、路由和本地图片引用问题。

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

插件默认只输出警告和 JSON 报告，不会改变现有构建结果。可以用 `severity` 按问题代码调整为 `error`、`warning` 或 `ignore`，也可以用 `ignores` 按代码、路由或文件路径忽略特定问题。需要将内容错误纳入 CI 门禁时，再显式设置 `failOnError: true`。报告会在构建继续失败时尽可能提前写入，便于 CI 保留诊断结果。
