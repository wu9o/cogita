---
title: Cogita 文档
---

# Cogita 文档

Cogita 是主题驱动的静态站点框架。它把站点配置、主题、插件和内容索引拆分为可复用的包，适合博客、项目手册和知识库。

## 推荐阅读顺序

1. [开始使用](./getting-started.md)：创建并构建第一个站点。
2. [配置](./configuration.md)：了解站点、主题和插件选项。
3. [包与能力地图](./package-map.md)：选择所需的包和能力。
4. [架构设计](./api/architecture-design.md)：理解构建期和运行时数据流。
5. [插件开发](./plugins/plugin-development.md)：创建可复用的构建扩展。
6. [主题开发](./theme-development.md)：发布独立主题包。

## 文档区域

- [使用指南](./guides/)：开发、部署和长期站点维护。
- [架构与 API](./api/)：框架契约、类型和数据流。
- [插件开发](./plugins/)：插件 API、设计说明和扩展边界。
- [主题使用与扩展](./theme-customization.md)：安装、配置和扩展主题。
- [内容仓库迁移](./guides/migration.md)：将站点内容迁移到独立仓库。

## 仓库边界

本仓库维护 Cogita 的 Core、插件、主题和手册示例。站点的文章和文档属于独立站点；仓库中的 Demo 只使用小型自定义数据集来展示主题接入方式。

## 参与贡献

- [贡献指南](https://github.com/wu9o/cogita/blob/main/CONTRIBUTING.md)
- [提交 Issue](https://github.com/wu9o/cogita/issues)
- [参与 Discussions](https://github.com/wu9o/cogita/discussions)

手册和实现会一起维护。如果示例与当前版本不一致，报告问题时请附上 Node.js、pnpm 和 Cogita 版本。
