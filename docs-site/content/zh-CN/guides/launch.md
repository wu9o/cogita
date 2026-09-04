---
title: 发布准备
---

# 发布准备

这份清单集中维护 Cogita 的产品定位、Demo 顺序和首次推广文案，适合分享给还不了解仓库的人。

## 一句话定位

Cogita 是一个主题驱动的静态站点框架，可以把博客、文档和知识库变成可复用的内容生态。

## 推荐展示顺序

先打开[主题总览](https://wu9o.github.io/cogita/demos/)，再根据读者的站点形态展示对应 Demo：

1. **Knowledge**：文章、文档、JSON、Git、搜索和反向链接。
2. **Docs**：项目手册、API 参考和聚焦导航。
3. **Lucid**：个人博客、归档、标签和连续阅读。
4. **Editorial**：专题写作、系列文章和精选发布。

每个 Demo 都是独立的站点消费者，仓库中同时包含它的配置和示例内容。

## 五分钟启动

```bash
pnpm dlx @cogita/cli create my-site --template knowledge
cd my-site
pnpm dev
```

博客使用 `--template blog`，手册使用 `--template docs`，需要 Git 或 JSON 内容源时使用 `--template knowledge-external`。

## 推广文案

> Meet Cogita — a theme-driven static site framework for blogs, docs, and knowledge bases.
>
> Pick a site shape, get a complete theme ecosystem, and add capabilities through plugins. The repo includes four independent demos, including a Knowledge theme that connects posts, documents, JSON, and Git sources.
>
> Explore the demos: https://wu9o.github.io/cogita/demos/

## 发布检查

- [ ] 首页和主题总览可以正常打开。
- [ ] 四个 Demo 链接都能打开并保持样式。
- [ ] 社交卡片使用当前英文定位。
- [ ] Quick Start 可以创建可运行站点。
- [ ] 版本和主干保持一致。
- [ ] 推文同时链接 Demo 总览和 GitHub 仓库。
