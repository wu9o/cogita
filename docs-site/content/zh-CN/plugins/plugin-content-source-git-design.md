---
title: Git 内容源适配器
---

# Git 内容源适配器

`@cogita/plugin-content-source-git` 读取部署流程已经 checkout 好的独立 Markdown 内容目录，将其接入统一 `ContentIndex`，并为有正文的条目生成静态页面。它不执行 `git clone`、`git pull` 或其他网络操作，版本、凭据和更新策略由部署平台管理。

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

适配器默认扫描 `md` 和 `mdx` 文件，并映射标题、描述、日期、标签、分类和图片字段。非 Markdown 文件会发布到隔离的 `/external-content/<source>/...` 命名空间；只有能匹配真实文件的相对资源引用会被改写，外部 URL 和不存在的引用保持不变。

## 与 JSON 内容源的边界

- Git 内容源适合由版本控制系统管理的 Markdown 原文，部署流程负责 checkout 某个 commit；
- JSON 内容源适合 CMS、API 或其他系统生成的稳定快照；
- 两者都通过 `ContentIndex` 提供给搜索、标签、内容关系和诊断插件。

只要内容源提供 `getContent`，Core 会自动生成正文附加页面；自定义内容源还可以通过 `getAssets` 发布资源。适配器的 `load`、`getContent` 和 `getAssets` 应支持 Core 的并行调用。

## GitHub Actions 接入

~~~yaml
- name: Checkout content repository
  uses: actions/checkout@v4
  with:
    repository: ${{ vars.COGITA_CONTENT_REPOSITORY }}
    ref: ${{ vars.COGITA_CONTENT_REF || 'main' }}
    path: git-content
    token: ${{ secrets.COGITA_CONTENT_TOKEN || github.token }}
~~~

私有内容仓库需要具备读取权限的 `COGITA_CONTENT_TOKEN`，不要把令牌写入配置或提交到仓库。固定 `COGITA_CONTENT_REF` 可以让站点构建具备可回溯性。完整示例见 [`examples/github-actions/external-content-deploy.yml`](https://github.com/wu9o/cogita/blob/main/examples/github-actions/external-content-deploy.yml)。
