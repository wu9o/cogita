---
title: 第三方起步模板
---

# 第三方起步模板

当一个能力需要被多个站点复用时，可以从仓库中的独立模板开始：

- [插件模板](https://github.com/wu9o/cogita/tree/main/starters/plugin)：包含 `CogitaPluginFactory`、构建上下文、统一日志和能力声明。
- [主题模板](https://github.com/wu9o/cogita/tree/main/starters/theme)：包含 `CogitaTheme`、必需的首页布局和全局样式。

## 验证复制后的包

复制模板后替换 `@your-scope` 包名，安装依赖并构建：

```bash
pnpm install
pnpm run build
```

插件通过站点的 `plugins` 数组注册，主题通过包名消费。发布检查会把模板复制到临时目录并执行真实构建，确保它们不依赖内部 workspace 路径。

## 从这里扩展

需要配置时，使用接收选项的工厂闭包；配置不满足时返回 `null`。需要页面时，在插件元数据中声明 `requiredLayouts`，并在主题中提供对应的 `pageLayouts`。只有浏览器确实需要数据时才新增版本化虚拟模块。
