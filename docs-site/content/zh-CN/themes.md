---
title: 主题总览
---

# 主题总览

Cogita 主题不只是颜色和字体。主题拥有页面布局、视觉语言和默认插件能力；站点选择主题，再提供自己的内容和导航。

## 内置主题

| 主题 | 适用场景 | 主要优势 | 包名 |
| --- | --- | --- | --- |
| Docs | 手册、API 和项目文档 | 导航、代码阅读、页面检索 | `@cogita/theme-docs` |
| Lucid | 个人博客和内容归档 | 文章、标签、搜索、连续阅读 | `@cogita/theme-lucid` |
| Editorial | 专题写作和系列内容 | 大标题、精选内容、编辑节奏 | `@cogita/theme-editorial` |
| Knowledge | Wiki、研究笔记和混合仓库 | 统一内容、搜索、标签、反向链接 | `@cogita/theme-knowledge` |

每个主题都有独立的 [Demo](https://wu9o.github.io/cogita/demos/)，可运行 `pnpm run demo` 在本地构建。

## 如何选择

- 读者主要依赖导航、代码和 API 时选择 **Docs**。
- 需要稳定写作、归档和搜索时选择 **Lucid**。
- 需要专题文章、系列和更强阅读节奏时选择 **Editorial**。
- 需要把文章、文档和反向链接放进同一空间时选择 **Knowledge**。

所有内置主题默认使用英文界面，并支持通过 `@cogita/plugin-i18n` 提供其他语言文案。界面翻译不会改变文章内容。
