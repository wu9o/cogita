---
title: Git 内容源适配器
---

# Git 内容源适配器

`@cogita/plugin-content-source-git` 用于读取部署流程已经 checkout 好的独立 Markdown 内容目录，并将其接入统一 `ContentIndex`，同时为有正文的条目生成静态 Markdown 页面。它不执行 `git clone`、`git pull` 或其他网络操作，因此 Git 仓库的版本、凭据和更新策略可以由 GitHub Actions、子模块或部署平台独立管理。

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

内容目录中的非 Markdown 文件会作为静态资源发布到隔离的 `/external-content/<source>/...` 命名空间。Git 适配器只会改写正文中能够匹配到真实文件的相对资源引用，例如 `guides/start.md` 中的 `![流程图](../assets/diagram.svg)` 会指向对应的站点公共路径；外部 URL、绝对 URL 和不存在的引用保持不变。这样开发预览和生产构建都能使用同一套资源路径，同时不会直接暴露外部 checkout 的原始 Markdown 文件。

## 与 JSON 内容源的边界

- Git 内容源适合由版本控制系统管理的 Markdown 原文，部署流程负责 checkout 哪一个 commit。
- JSON 内容源适合 CMS、API 或其他系统生成的稳定快照，也可以在构建期读取远程 JSON 地址。
- 两者都通过 `ContentIndex` 提供给搜索、标签、内容关系和内容诊断，不需要主题为每种来源增加专用逻辑。

只要内容源提供 `getContent`，Core 会自动把条目正文作为附加页面生成；因此 `routePrefix: 'notes'` 对应的
`architecture.md` 会生成 `/notes/architecture`。没有正文的 JSON 条目仍可进入索引，但不会生成空页面。

Knowledge Demo 使用 `demos/knowledge/git-content` 模拟一个独立 checkout，访问 `/demos/knowledge/` 可以看到它和本地文章、普通文档及 JSON 来源一起进入知识库。

如果自定义 `ContentSource` 也需要发布资源，可以实现可选的 `getAssets`：返回 `{ filePath, publicPath }` 数组。`filePath` 是构建机上的文件路径，`publicPath` 必须是相对于公共目录的正斜杠路径；Core 会在每轮构建前复制这些文件，并清理上一轮的 `external-content` 命名空间。适配器的 `load`、`getContent` 和 `getAssets` 应该支持 Core 的并行调用；Git 适配器会在首次读取时建立快照，并在下一轮显式 `load` 时刷新。

## GitHub Actions 接入

站点仓库可以在构建前用第二次 `actions/checkout` 把内容仓库放到配置指定的目录：

~~~yaml
- name: Checkout content repository
  uses: actions/checkout@v4
  with:
    repository: ${{ vars.COGITA_CONTENT_REPOSITORY }}
    ref: ${{ vars.COGITA_CONTENT_REF || 'main' }}
    path: git-content
    token: ${{ secrets.COGITA_CONTENT_TOKEN || github.token }}
~~~

站点的 `cogita.config.ts` 使用 `directory: 'git-content'`，随后执行普通的 `pnpm exec cogita build` 即可。完整的 Pages 工作流见仓库中的 [`examples/github-actions/external-content-deploy.yml`](https://github.com/wu9o/cogita/blob/main/examples/github-actions/external-content-deploy.yml)。

需要在站点仓库配置 `COGITA_CONTENT_REPOSITORY` 变量；私有内容仓库还需要一个有读取权限的 `COGITA_CONTENT_TOKEN`，不要把令牌写入配置文件或提交到仓库。`COGITA_CONTENT_REF` 可选，用于固定分支、标签或 commit，从而让站点构建具备可回溯性。
