---
title: 快速开始
---

# 快速开始

Cogita 是一个基于 Rspress 的主题驱动静态站点框架。站点项目只需要安装 Core、CLI 和一个主题包，就可以开始构建。

## 使用模板创建项目

推荐直接使用 CLI 初始化项目：

~~~bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
~~~

博客模板使用 Lucid 主题和 `posts/` 目录；文档模板使用 Docs 主题和 `content/` 目录。生成后进入项目并运行 `pnpm run dev` 即可开始开发。

## 安装

~~~bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-docs
~~~

## 创建配置

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的文档',
    description: '项目使用手册',
  },
  theme: '@cogita/theme-docs',
});
~~~

## 构建站点

~~~bash
pnpm exec cogita build
~~~

主题由消费方项目直接安装。Core 负责读取配置、解析主题并组装 Rspress，主题和插件各自维护自己的页面能力。
