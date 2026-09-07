---
title: 架构与 API
---

# 架构与 API

Cogita 使用一组稳定的公共契约，把站点配置、主题、插件和静态产物连接起来。

## 核心文档

- [架构设计](./architecture-design.md)：了解配置流转、主题解析和插件组装。
- [内容索引设计](./content-index-design.md)：了解主题与插件共享的内容模型。
- [API 参考](./api-reference.md)：查看公共类型和辅助 API。
- [主题开发指南](../theme-development.md)：了解主题包结构和发布方式。

## 按角色阅读

- 站点作者：先阅读[配置](../configuration.md)和[主题使用与扩展](../theme-customization.md)。
- 主题作者：阅读[架构设计](./architecture-design.md)和[主题开发指南](../theme-development.md)。
- 插件作者：阅读[插件 API 规范](../plugins/plugin-api-specification.md)以及对应的能力设计文档。

核心目标是保持边界稳定：Core 解析站点，主题定义阅读体验，插件提供可复用能力，但不接管站点内容。
