---
title: 部署指南
---

# 部署指南

Cogita 生成一个可以由任意静态文件服务器托管的目录。本仓库使用 `docs-site` 作为手册示例；独立博客或文档站只需要自己的内容目录和配置。

## 构建站点

在 Cogita 仓库中运行：

```bash
pnpm install --frozen-lockfile
pnpm run build:docs
```

输出写入 `docs-site/doc_build`。独立站点通常运行 `pnpm exec cogita build`，输出到自己的 `doc_build` 目录。

## GitHub Pages

仓库提供 `.github/workflows/deploy.yml`，负责安装 Node.js 和 pnpm、构建工作区包、构建 `docs-site`、构建四个主题 Demo，并把 `docs-site/doc_build` 发布到 GitHub Pages。Pages 的来源应设置为 GitHub Actions，然后推送到 `main`。

`site.base` 必须与部署路径一致：

~~~ts
export default defineConfig({
  site: {
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
  },
});
~~~

自定义域名通常使用 `/` 作为 `base`，并同时更新 `url`。部署后手册位于 `/cogita/`，Demo 入口位于 `/cogita/demos/`；本地 `pnpm run demo` 使用 `/demos/`。

独立站点可以复用以下发布步骤：

```yaml
- run: pnpm exec cogita build
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./doc_build
```

不要把框架仓库的 `docs-site` 路径复制到独立站点，发布目录必须是实际构建输出。

如果内容位于另一个 Git 仓库，应在构建前执行第二次 `actions/checkout`，并 checkout 到 `createGitContentSource` 配置的目录。公共内容仓库可使用默认 `github.token`；私有仓库的变量和凭据应放在 Repository Variables 与 Secrets 中。

## 其他静态托管平台

- Vercel 根目录在仓库根时，构建命令为 `pnpm run build:docs`，输出目录为 `docs-site/doc_build`；
- Netlify 根目录在仓库根时，发布目录为 `docs-site/doc_build`；
- Cloudflare Pages 使用同样的构建命令和输出目录；
- 任意静态服务器都可以使用 `pnpm dlx serve docs-site/doc_build` 或 `python -m http.server 8000 --directory docs-site/doc_build` 预览。

## 部署前检查

至少运行：

```bash
pnpm run build:docs
pnpm run check
pnpm run test
```

并确认输出包含 `index.html`，`site.base` 与部署路径一致，主题和插件来自当前站点依赖，文章、图片、Feed 和内部链接没有指向废弃博客路径。

### 常见问题

- GitHub Pages 404：检查 `site.base`、`site.url` 和 `builderConfig.output.assetPrefix` 是否使用同一个前缀；
- 静态资源 404：通常是托管路径与 `base` 不一致；
- 主题或插件无法解析：确认消费者 `package.json` 已声明依赖，再运行冻结安装和包构建；
- 本地与生产路径不同：本地可使用 `/`，发布前应使用生产配置构建并执行预览。
