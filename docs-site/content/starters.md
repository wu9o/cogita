---
title: 第三方扩展 Starter
---

# 第三方扩展 Starter

如果需要为多个站点复用能力，可以从仓库中的 starter 复制一个独立包：

- [插件 starter](https://github.com/wu9o/cogita/tree/main/starters/plugin)：包含 `CogitaPluginFactory`、构建上下文、统一日志和能力声明。
- [主题 starter](https://github.com/wu9o/cogita/tree/main/starters/theme)：包含 `CogitaTheme`、必需的首页布局和全局样式。

## 验证复制后的包

复制 starter 后，先替换 `@your-scope` 占位包名，再安装依赖并构建：

```bash
pnpm install
pnpm run build
```

插件通过站点配置的 `plugins` 数组注册；主题通过 `theme` 包名消费。仓库会在发布检查中把两个 starter 复制到临时目录，并分别执行真实的包构建，确保模板不会因为内部 workspace 路径而只能在 Cogita 仓库中工作。

## 下一步扩展

插件需要配置时，优先使用工厂闭包传入选项，并在配置不满足时返回 `null`。需要页面时，在插件元数据中声明 `requiredLayouts`，同时在主题中提供对应的 `pageLayouts`。需要浏览器数据时，再增加带稳定版本标识的虚拟模块，并为独立消费者补充构建或浏览器验收。
