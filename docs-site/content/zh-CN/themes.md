---
title: 主题总览
---

# 主题总览

Cogita 主题不只是颜色和字体。主题拥有页面布局、视觉语言以及声明好的默认插件能力；站点选择主题，并提供自己的内容和导航。

## 可用主题

| 主题 | 适用场景 | 重点 | 包 |
| --- | --- | --- | --- |
| **Docs** | 手册、API 参考、知识库 | 导航、代码阅读、页面搜索 | `@cogita/theme-docs` |
| **Lucid** | 个人博客和归档 | 文章、主题、搜索、阅读流程 | `@cogita/theme-lucid` |
| **Editorial** | 专题写作和系列内容 | 标题、精选内容、编辑节奏 | `@cogita/theme-editorial` |
| **Knowledge** | Wiki、研究笔记、混合仓库 | 统一内容、搜索、主题、反向链接 | `@cogita/theme-knowledge` |

每个主题都有独立的 [`demos/`](https://github.com/wu9o/cogita/tree/main/demos) 消费者。运行 `pnpm run demo` 可以构建和预览四个主题。

## 主题 Demo

| Demo | 查看重点 | 链接 |
| --- | --- | --- |
| **Docs** | 手册导航、专注阅读和参考页面 | [打开 Docs Demo](https://wu9o.github.io/cogita/demos/docs/) |
| **Lucid** | 轻量发布流程、笔记和归档 | [打开 Lucid Demo](https://wu9o.github.io/cogita/demos/lucid/) |
| **Editorial** | 专题叙事和精选系列 | [打开 Editorial Demo](https://wu9o.github.io/cogita/demos/editorial/) |
| **Knowledge** | 文章、文档、JSON、Git 来源和反向链接 | [打开 Knowledge Demo](https://wu9o.github.io/cogita/demos/knowledge/) |

[完整 Demo 展示页](https://wu9o.github.io/cogita/demos/) 是比较四种内容体验最快的入口。每个 Demo 也都在本仓库中，可以直接检查配置和示例内容。

## 如何选择

- 读者主要浏览导航、代码和 API 参考时选择 **Docs**。
- 需要持续写作、归档和搜索时选择 **Lucid**。
- 需要专题文章、系列内容和更强阅读节奏时选择 **Editorial**。
- 希望把文章、文档和反向链接放进同一空间时选择 **Knowledge**。

所有官方主题均英文优先，并支持 `@cogita/plugin-i18n`。可以通过 `i18n.messages` 翻译界面，不需要改写文章内容。
