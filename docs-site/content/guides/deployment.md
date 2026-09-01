---
title: 部署指南
---

# 部署指南

Cogita 的构建结果是一个可以被任意静态文件服务器托管的目录。框架仓库本身使用 `docs-site` 作为使用手册示例；独立博客或其他站点项目只需要把下面的目录替换成自己的站点目录。

## 构建站点

在 Cogita 框架仓库中：

```bash
pnpm install --frozen-lockfile
pnpm run build:docs
```

构建结果位于 `docs-site/doc_build`。独立站点项目则执行自己的 `pnpm exec cogita build`，输出目录通常是项目下的 `doc_build`。

## GitHub Pages

### 使用 GitHub Actions

框架仓库已经提供 `.github/workflows/deploy.yml`，它会：

1. 安装 Node.js 和 pnpm；
2. 构建工作区包；
3. 构建 `docs-site`；
4. 构建四个主题 Demo，并合并到 `docs-site/doc_build/demos/`；
5. 将 `docs-site/doc_build` 上传到 GitHub Pages。

使用时需要在仓库设置中将 **Pages / Build and deployment / Source** 设置为 **GitHub Actions**，然后推送到 `main` 分支。

站点配置中的 `site.base` 必须与部署路径一致。例如仓库 `wu9o/cogita` 使用：

```ts
export default defineConfig({
  site: {
    base: '/cogita/',
    url: 'https://wu9o.github.io/cogita/',
  },
});
```

如果使用自定义域名，通常把 `base` 改为 `/`，并同步更新 `url`。

部署完成后，使用手册位于 `/cogita/`，主题 Demo 总览位于 `/cogita/demos/`，四个独立主题 Demo 位于其下的主题目录。Demo 构建会使用与 Pages 一致的 `/cogita/` 前缀；本地 `pnpm run demo` 仍使用 `/demos/` 前缀。

### 独立站点仓库

独立站点可以复用同样的工作流，只需要把构建命令和发布目录改成该项目的目录：

```yaml
- run: pnpm exec cogita build
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./doc_build
```

不要把框架仓库的 `docs-site` 路径复制到独立站点中；发布目录应该始终以实际构建产物为准。

## Vercel

在 Vercel 项目中可以使用以下设置：

- **Framework Preset**：Other
- **Install Command**：`pnpm install --frozen-lockfile`
- **Build Command**：`pnpm run build:docs`
- **Output Directory**：`docs-site/doc_build`

如果 Vercel 项目的根目录已经设置为 `docs-site`，则使用：

- **Build Command**：`pnpm exec cogita build`
- **Output Directory**：`doc_build`

两种配置只能选择一种，避免同时叠加根目录和仓库根目录的路径。

## Netlify

仓库根目录部署的推荐设置：

- **Base directory**：留空
- **Build command**：`pnpm run build:docs`
- **Publish directory**：`docs-site/doc_build`

手动发布构建结果：

```bash
pnpm run build:docs
pnpm dlx netlify-cli deploy --prod --dir=docs-site/doc_build
```

## Cloudflare Pages

如果项目根目录是仓库根目录：

- **Build command**：`pnpm run build:docs`
- **Build output directory**：`docs-site/doc_build`
- **Root directory**：`/`

如果项目已经把 `docs-site` 设为 Root directory，则输出目录改为 `doc_build`，构建命令改为 `pnpm exec cogita build`。

## 自定义静态服务器

构建完成后可以使用任意静态文件服务器预览：

```bash
pnpm run build:docs
pnpm dlx serve docs-site/doc_build
```

也可以使用 Python：

```bash
python -m http.server 8000 --directory docs-site/doc_build
```

访问 `http://localhost:8000` 检查页面、资源和站内链接是否正常。

## Docker

下面的 Dockerfile 适用于框架仓库根目录：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY plugins ./plugins
COPY themes ./themes
COPY docs-site ./docs-site

RUN pnpm install --frozen-lockfile
RUN pnpm run build:docs

FROM nginx:alpine
COPY --from=builder /app/docs-site/doc_build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和启动：

```bash
docker build -t cogita-docs .
docker run --rm -p 8080:80 cogita-docs
```

## 部署前检查

在提交部署前，建议至少运行：

```bash
pnpm run build:docs
pnpm run check
pnpm run test
```

然后确认：

- 构建输出目录存在且包含 `index.html`；
- `site.base` 与实际部署路径一致；
- 主题和插件包都来自当前站点的依赖；
- 文章、图片、RSS 和站内链接没有指向已经迁移的旧博客路径。

## 常见问题

### GitHub Pages 显示 404

优先检查 `site.base`、`site.url` 和 `builderConfig.output.assetPrefix` 是否使用了同一个基础路径。修改后必须重新构建，不能只刷新旧的 `doc_build`。

### 页面能打开但资源 404

通常是静态托管路径和 `base` 不一致。仓库 Pages 使用 `/仓库名/`，自定义域名使用 `/`；不要把两种配置混用。

### 构建找不到主题或插件

主题和插件由消费方项目安装。先确认 `package.json` 中存在对应依赖，再执行：

```bash
pnpm install --frozen-lockfile
pnpm run build:packages
```

### 本地预览和线上路径不同

本地开发可以使用 `/`，但生产构建要使用线上路径。建议在提交前用生产配置构建一次，并使用 `pnpm --filter docs-site preview` 检查最终产物。
