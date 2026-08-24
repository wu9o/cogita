---
title: Cogita 文档中心
---

# Cogita 文档中心

Cogita 是一个主题驱动的静态站点框架。它把站点配置、主题、插件和内容索引拆成可独立复用的包，适合构建博客、项目文档和其他内容型站点。

## 推荐阅读路径

如果你第一次使用 Cogita，建议按下面的顺序阅读：

1. [快速开始](./getting-started.md)：安装包并构建第一个站点。
2. [配置指南](./configuration.md)：了解站点、主题和插件配置。
3. [架构设计](./api/architecture-design.md)：理解构建时与运行时的数据流。
4. [插件开发指南](./plugins/plugin-development.md)：开发自己的构建插件。
5. [主题开发指南](./theme-development.md)：创建独立的主题包。

## 文档分类

- [使用指南](./guides/)：开发、部署和项目组织。
- [API 与架构](./api/)：核心配置、类型和框架设计。
- [插件开发](./plugins/)：插件 API、设计文档和实现约束。
- [主题使用与扩展](./theme-customization.md)：安装、配置和扩展主题。

## 当前仓库的边界

本仓库维护 Cogita 的核心包、插件包、主题包和使用手册示例。个人博客文章属于独立的站点内容，不作为框架仓库的内置 Demo；文档站只保留用于说明框架能力的最小示例。

## 贡献与反馈

- [贡献指南](https://github.com/wu9o/cogita/blob/main/CONTRIBUTING.md)
- [提交 Issue](https://github.com/wu9o/cogita/issues)
- [参与 Discussions](https://github.com/wu9o/cogita/discussions)

文档与代码保持同步维护。如果某个示例无法按当前版本运行，请优先提交 Issue，并附上 Node.js、pnpm 和 Cogita 包版本。
