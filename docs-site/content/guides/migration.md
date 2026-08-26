---
title: 从框架仓库拆分站点内容
---

# 从框架仓库拆分站点内容

Cogita 的框架仓库只负责维护 Core、插件、主题和使用手册示例。个人博客、团队知识库或产品文档应该作为独立站点项目，安装并消费这些包。

## 为什么要拆分

把真实博客文章放在框架仓库里，会让两个生命周期互相影响：

- 框架升级会被内容变更干扰，构建和发布边界不清晰；
- 使用手册只能复用真实博客的主题与页面，无法准确展示框架能力；
- 评论、图片和文章资源会绑定到框架仓库，迁移和权限管理都更复杂。

拆分后，框架仓库发布包和使用手册，内容仓库只负责文章、站点配置和部署。

## 独立站点的最小结构

一个消费 Cogita 的站点可以从下面的结构开始：

```text
my-site/
├── content/             # 普通 Markdown 文档
├── posts/               # 使用文章插件时的文章目录
├── public/              # 静态资源
├── cogita.config.ts
└── package.json
```

文档站使用 `contentDir`，博客站使用 `posts` 和对应主题插件；两种内容模型可以按项目需要选择，不要求放在同一个仓库中。

## 安装框架包

独立站点直接声明公开发布的包：

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-lucid
```

如果站点只展示项目文档，也可以使用技术文档主题：

```bash
pnpm add -D @cogita/theme-docs
```

主题和插件由站点项目安装，Core 不再从框架仓库内部隐式绑定主题。

## 配置示例

### 文档站

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '项目使用手册',
    description: '面向开发者的配置与 API 文档。',
    base: '/my-site/',
    url: 'https://example.github.io/my-site/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
});
```

### 博客站

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '记录技术与思考。',
    base: '/',
  },
  posts: {
    dir: 'posts',
    routePrefix: 'posts',
  },
  theme: '@cogita/theme-lucid',
});
```

## 迁移步骤

1. 在独立仓库中复制文章、图片和评论相关配置。
2. 将 `package.json` 改为安装已发布的 Cogita 包，而不是 `workspace:*`。
3. 按站点类型选择 `contentDir` 或 `posts` 配置。
4. 根据新仓库地址更新 `site.base`、`site.url` 和评论映射。
5. 在新仓库中单独配置 GitHub Pages 或其他静态托管流水线。
6. 构建并检查所有页面、资源、RSS 和评论入口，再下线旧内容路径。

## 版本策略

框架仓库通过 Changesets 管理包版本。独立站点不需要复制整个 monorepo，只需要在自己的 `package.json` 中锁定一组兼容版本：

```json
{
  "devDependencies": {
    "@cogita/cli": "^0.1.19",
    "@cogita/core": "^0.12.3",
    "@cogita/theme-lucid": "^0.11.2"
  }
}
```

升级时先阅读对应包的 changelog，再一次性更新 CLI、Core、主题和站点使用到的插件，避免只升级其中一个包造成契约不匹配。

## 验收清单

- 独立仓库可以在没有 Cogita 源码的情况下安装依赖并构建；
- 线上路径下的 CSS、JavaScript、图片和站内链接都能加载；
- 评论仓库和文章仓库的配置没有继续指向框架仓库；
- 框架仓库的使用手册不依赖个人博客文章作为示例内容。

框架仓库还提供了针对同级 `cogita-blog` 仓库的发布包消费者验证。它会复制博客配置、文章和公共资源到临时目录，用当前构建出的 tarball 替换已发布依赖，然后检查首页、文章页、图片相关输出、RSS 和 sitemap：

```bash
COGITA_BLOG_DIR=/path/to/cogita-blog pnpm run check:external-blog
```

该命令不会修改博客仓库，也不会要求博客仓库加入 Cogita monorepo。

使用手册也提供了独立消费者验证，用当前构建出的发布包安装一个临时文档站副本，检查文档主题、内容目录和代表性页面路由：

```bash
pnpm run check:docs-consumer
```

该检查不会修改 `docs-site`，用于确保使用手册不依赖博客的 `posts` 目录，也不会因为 workspace 链接掩盖主题或路由问题。
