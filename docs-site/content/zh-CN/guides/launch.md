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

## X 推文版本

### 短版推文

> Cogita is a theme-driven static site framework for blogs, docs, and knowledge bases.
>
> Choose a site shape, compose capabilities through plugins, and keep your content independent.
>
> Explore four live demos: https://wu9o.github.io/cogita/demos/

### 串文展开顺序

1. 先提出问题：博客、项目手册和知识库不应该分别依赖三套互不相关的技术栈。
2. 再展示模型：主题负责阅读体验，插件提供能力，站点自己拥有内容。
3. 打开 Knowledge Demo，展示文章、文档、JSON、Git 内容源、搜索和反向链接如何放在一个站点中。
4. 再展示 Docs、Lucid 和 Editorial，说明同一框架如何适配不同的发布形态。
5. 最后给出 Quick Start 命令，并邀请大家反馈最需要的站点形态或内容源。

## 可分享素材

- [主题总览](https://wu9o.github.io/cogita/demos/)：社交推广的主入口。
- [Knowledge Demo](https://wu9o.github.io/cogita/demos/knowledge/)：核心能力展示入口。
- [在线工作手册](https://wu9o.github.io/cogita/)：配置、架构和扩展说明。
- [GitHub 仓库](https://github.com/wu9o/cogita)：源码、模板和贡献入口。
- [社交卡片源码](https://github.com/wu9o/cogita/blob/main/demos/landing/social-card.svg)：主题总览使用的英文预览图。

只有在 Pages 工作流已经部署同一个提交后，才发布这些线上链接。本地构建只能证明包和页面契约通过，不能证明公网地址已经更新。

## 发布检查

- [ ] 首页和主题总览可以正常打开。
- [ ] 四个 Demo 链接都能打开并保持样式。
- [ ] 社交卡片使用当前英文定位。
- [ ] Quick Start 可以创建可运行站点。
- [ ] 版本和主干保持一致。
- [ ] 推文同时链接 Demo 总览和 GitHub 仓库。
