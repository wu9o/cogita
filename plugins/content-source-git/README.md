# @cogita/plugin-content-source-git

将一个由部署流程提前 checkout 的独立 Git 内容目录接入 Cogita 的统一 `ContentIndex`。适合把文档仓库、团队知识库或独立内容仓库和站点代码分开维护。

## 使用

```bash
pnpm add @cogita/plugin-content-source-git
```

```ts
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
```

`directory` 可以指向站点外部的 Git checkout，也可以指向站点仓库中的子目录。适配器只负责读取已经存在的目录，不执行 `git clone`、`git pull` 或其他网络操作；GitHub Actions、子模块或部署平台负责决定内容仓库和 commit。

Markdown 文件支持 `title`、`description`、`excerpt`、`author`、`date`、`createDate`、`updateDate`、`tags`、`categories`、`image` 和 `imageAlt` 等 frontmatter 字段。`kind: 'post'` 时必须提供 `date` 或 `createDate`。

正文会通过 `ContentIndex.getPostContent()` 按需提供给搜索和内容关系插件，因此外部文件不会被这些插件重复扫描。
