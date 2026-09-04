---
title: 包与能力地图
---

# 包与能力地图

Cogita 将框架能力拆成可以独立发布的包。站点只安装实际使用的能力，不需要把所有插件都放进依赖图。

## 核心包

| 包 | 职责 |
| --- | --- |
| `@cogita/core` | 加载配置、解析主题并组装 Rspress |
| `@cogita/cli` | 提供 `dev`、`build` 和 `preview` 命令 |
| `@cogita/shared` | 共享类型和构建期上下文 |
| `@cogita/ui` | 可复用的基础 UI 组件 |

## 主题包

| 包 | 适用场景 | 默认重点 |
| --- | --- | --- |
| `@cogita/theme-docs` | 项目手册和技术文档 | 文档导航和技术内容 |
| `@cogita/theme-lucid` | 个人博客和内容站点 | 文章列表、归档和搜索 |
| `@cogita/theme-editorial` | 编辑型内容站点 | 精选文章和内容浏览 |
| `@cogita/theme-knowledge` | Wiki、研究笔记和知识库 | 统一内容、搜索和反向链接 |

## 插件包

文章索引、内容关系、JSON / Git 内容源、文章列表、标签、分类、合集、搜索、图片、SEO、站点地图、RSS、评论、阅读进度、代码复制和内容检查都以独立插件提供。

插件使用 `config.search`、`config.comments`、`config.images` 等结构化命名空间。没有匹配配置或主题布局时，插件应优雅降级，而不是强迫所有站点启用博客能力。

## 选择建议

- 项目手册：选择 `@cogita/theme-docs`，配置 `contentDir`。
- 个人博客：选择 `@cogita/theme-lucid`，配置 `posts` 和所需文章插件。
- 知识库：选择 `@cogita/theme-knowledge`，按需配置 `posts`、`contentDir` 和内容源适配器。
- 共享功能：创建独立插件，不要把站点业务逻辑放进主题或 Core。
