---
title: 开始使用
---

# 开始使用

Cogita 是一个基于 Rspress 的主题驱动静态站点框架。一个站点只需要 Core、CLI 和一个主题包即可启动。

## 使用模板创建项目

```bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
pnpm dlx @cogita/cli create my-knowledge --template knowledge
```

博客模板使用 Lucid 主题和 `posts/` 目录；Docs 模板使用 Docs 主题和 `content/` 目录；Knowledge 模板会把文章和文档统一接入搜索、标签与内容关系。进入项目后运行 `pnpm run dev`。

也可以运行 `pnpm run demo`，在本地查看四个主题 Demo。

## 手动安装

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-docs
```

## 创建配置

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的项目手册',
    description: '一份实用的项目手册',
  },
  theme: '@cogita/theme-docs',
  i18n: {
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
  },
});
```

## 构建站点

```bash
pnpm exec cogita build
```

Core 负责加载配置、解析主题并组装 Rspress；主题声明需要的能力，插件负责构建期数据和运行时模块。
