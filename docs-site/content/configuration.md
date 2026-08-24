---
title: 配置指南
---

# 配置指南

Cogita 站点通过项目根目录的 `cogita.config.ts` 配置。配置文件只描述站点意图，Core 负责加载主题、合并插件并交给 Rspress 构建。

## 最小配置

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的站点',
    description: '站点简介',
  },
  theme: '@cogita/theme-docs',
});
~~~

## 配置边界

- `site`：站点标题、描述、URL 和基础路径等元数据。
- `theme`：由消费方项目直接安装的主题包名称或本地路径。
- `themeConfig`：传给主题的展示配置，例如导航和侧边栏。
- `plugins`：站点额外注册的插件工厂。
- `builderConfig`：透传给 Rspress 的构建配置。

完整字段和类型请参考 [API 参考](./api/api-reference.md)。

## 主题与插件的依赖关系

主题和插件是独立的工作空间包。Core 不内置具体主题，也不负责替站点安装主题依赖；站点必须在自己的 `package.json` 中声明使用的主题和插件。这样可以让博客、文档站和其他内容站点分别选择依赖与版本。

## 构建命令

~~~bash
pnpm exec cogita build
~~~

开发模式和部署方式请参考[开发指南](./guides/development.md)与[部署指南](./guides/deployment.md)。
