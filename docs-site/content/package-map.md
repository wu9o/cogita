---
title: 包与能力地图
---

# 包与能力地图

Cogita 把框架能力拆成可以独立发布的包。站点项目只需要安装自己用到的部分，不需要把所有插件都加入依赖。

## 核心包

| 包 | 职责 | 站点是否直接安装 |
| --- | --- | --- |
| `@cogita/core` | 加载配置、解析主题、组装 Rspress | 是 |
| `@cogita/cli` | 提供 `dev`、`build`、`preview` 命令 | 是 |
| `@cogita/shared` | 共享类型和构建期上下文 | 通常由其他包间接使用 |
| `@cogita/ui` | 可复用的基础 UI 组件 | 按需 |

## 主题包

| 包 | 适用场景 | 默认侧重点 |
| --- | --- | --- |
| `@cogita/theme-docs` | 项目使用手册、技术文档 | 文档导航、首页入口和技术内容 |
| `@cogita/theme-lucid` | 个人博客和内容型站点 | 文章列表、归档、搜索和博客交互 |
| `@cogita/theme-editorial` | 编辑感更强的内容站点 | 文章展示和内容浏览 |

主题不是单纯的 CSS 皮肤。主题通过 `pageLayouts` 声明页面布局，并通过 `plugins` 声明它需要的默认能力。

## 插件包

| 能力 | 包 |
| --- | --- |
| 文章元数据和内容索引 | `@cogita/plugin-posts-frontmatter` |
| 内容关系和反向链接 | `@cogita/plugin-content-relations` |
| 文章列表和归档 | `@cogita/plugin-blog-list` |
| 标签、分类和合集 | `@cogita/plugin-tags`、`@cogita/plugin-categories`、`@cogita/plugin-collections` |
| 搜索、阅读进度和代码复制 | `@cogita/plugin-search`、`@cogita/plugin-reading-progress`、`@cogita/plugin-code-copy` |
| 图片、SEO、站点地图和 RSS | `@cogita/plugin-images`、`@cogita/plugin-seo`、`@cogita/plugin-sitemap`、`@cogita/plugin-rss` |
| 评论和内容检查 | `@cogita/plugin-comments`、`@cogita/plugin-content-check` |

插件通过结构化配置命名空间工作，例如 `config.search`、`config.comments` 和 `config.images`。没有对应配置或主题布局时，插件应优雅降级，不应该让所有站点都被迫启用博客能力。

## 选择建议

- 做项目手册：安装 `@cogita/theme-docs`，配置 `contentDir`。
- 做个人博客：安装 `@cogita/theme-lucid`，配置 `posts` 和文章相关插件。
- 做定制站点：选择一个主题作为基础，再通过站点插件和主题扩展补充能力。
- 开发公共能力：优先创建独立插件，不要把站点业务逻辑写进主题或 Core。
