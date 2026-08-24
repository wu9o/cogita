---
title: 快速开始
---

# 快速开始

Cogita 是一个基于 Rspress 的主题驱动静态站点框架。站点项目只需要安装 Core、CLI 和一个主题包，就可以开始构建。

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
