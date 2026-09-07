---
title: 第三方扩展模板
---

# 第三方扩展模板

当某项能力需要在多个站点复用时，可以从仓库模板复制一个独立包：

- [插件模板](https://github.com/wu9o/cogita/tree/main/starters/plugin)：包含 `CogitaPluginFactory`、构建上下文、统一日志和能力声明。
- [主题模板](https://github.com/wu9o/cogita/tree/main/starters/theme)：包含 `CogitaTheme`、必需的首页布局和全局样式。

## 验证复制的包

复制模板后，替换 `@your-scope` 占位包名，安装依赖并构建：

~~~bash
pnpm install
pnpm run build
~~~

通过站点的 `plugins` 数组注册插件，并通过包名消费主题。发布检查会把两个模板复制到临时目录并执行真实构建，确保模板不依赖工作区内部路径。

## 从模板继续扩展

插件需要配置时，优先使用接收选项的工厂闭包；配置不满足时返回 `null`。插件需要页面时，在元数据中声明 `requiredLayouts`，并由主题提供匹配的 `pageLayouts`。只有浏览器需要数据时才增加带版本的虚拟模块，并为独立消费者补充构建或浏览器验收检查。
