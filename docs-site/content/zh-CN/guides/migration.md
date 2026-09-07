---
title: 将站点内容与框架仓库拆分
---

# 将站点内容与框架仓库拆分

Cogita 框架仓库维护 Core、插件、主题和手册示例。个人博客、团队知识库和产品文档应作为独立消费者站点安装并使用这些包。

## 为什么拆分仓库

将真实文章放在框架仓库会把两种生命周期耦合起来：框架升级会和内容变更混在一起，手册只能通过真实博客页面展示框架，评论、图片和文章资源也会绑定框架历史与权限。

拆分后，框架仓库发布包和手册，内容仓库负责文章、站点配置和部署。

## 最小消费者结构

```text
my-site/
├── content/             # Markdown 文档
├── posts/               # 使用文章插件时的文章集合
├── public/              # 静态资源
├── cogita.config.ts
└── package.json
```

文档站使用 `contentDir`，博客使用 `posts` 和主题插件；两种内容模型可以独立选择，不要求共用仓库。

## 安装框架包

在消费者站点直接声明已发布的包：

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-lucid
```

纯文档站使用：

```bash
pnpm add -D @cogita/theme-docs
```

消费者自行安装主题和插件，Core 不会隐式绑定框架 monorepo 中的主题。

## 迁移步骤

1. 将文章、图片和评论配置复制到独立仓库；
2. 用已发布的 Cogita 包替换 `workspace:*` 依赖；
3. 根据站点类型选择 `contentDir` 或 `posts`；
4. 更新 `site.base`、`site.url` 和新仓库的评论映射；
5. 在新仓库配置 GitHub Pages 或其他静态托管；
6. 在废弃旧路径前构建并检查每个页面、资源、Feed 和评论入口。

## 版本策略与验收

框架仓库使用 Changesets 发布包。消费者只需要在自己的 `package.json` 中使用一组兼容版本；升级时先阅读各包变更记录，再一起升级 CLI、Core、主题和站点插件，避免只升级共享契约的一侧。

验收要求包括：独立仓库脱离 Cogita 源码树也能安装和构建；生产路径下 CSS、JavaScript、图片和内部链接可用；评论和文章仓库不再指向框架仓库；手册不依赖个人博客文章作为示例。

框架还提供独立博客消费者检查：

```bash
COGITA_BLOG_DIR=/path/to/cogita-blog pnpm run check:external-blog
```

以及独立文档消费者检查：

```bash
pnpm run check:docs-consumer
```

这些检查不会修改内容仓库或 `docs-site`，用于确认消费者不依赖工作区路径，也不会把路由问题隐藏在 workspace 链接之后。
