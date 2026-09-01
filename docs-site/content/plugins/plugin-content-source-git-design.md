---
title: Git 内容源适配器
---

# Git 内容源适配器

`@cogita/plugin-content-source-git` 用于读取部署流程已经 checkout 好的独立 Markdown 内容目录，并将其接入统一 `ContentIndex`。它不执行 `git clone`、`git pull` 或其他网络操作，因此 Git 仓库的版本、凭据和更新策略可以由 GitHub Actions、子模块或部署平台独立管理。

## 配置

~~~ts
import { defineConfig } from '@cogita/core';
import { createGitContentSource } from '@cogita/plugin-content-source-git';

export default defineConfig({
  contentSources: [
    createGitContentSource({
      id: 'team-notes',
      directory: '../team-notes',
      kind: 'document',
      routePrefix: 'notes',
    }),
  ],
});
~~~

适配器默认扫描 `md` 和 `mdx` 文件。`title`、`description`、`excerpt`、`author`、`date`、`createDate`、`updateDate`、`tags`、`categories`、`image` 和 `imageAlt` 会映射到统一内容条目；设置 `kind: 'post'` 时，每篇文件必须提供 `date` 或 `createDate`。

## 与 JSON 内容源的边界

- Git 内容源适合由版本控制系统管理的 Markdown 原文，部署流程负责 checkout 哪一个 commit。
- JSON 内容源适合 CMS、API 或其他系统生成的稳定快照，也可以在构建期读取远程 JSON 地址。
- 两者都通过 `ContentIndex` 提供给搜索、标签、内容关系和内容诊断，不需要主题为每种来源增加专用逻辑。

Knowledge Demo 使用 `demos/knowledge/git-content` 模拟一个独立 checkout，访问 `/demos/knowledge/` 可以看到它和本地文章、普通文档及 JSON 来源一起进入知识库。
