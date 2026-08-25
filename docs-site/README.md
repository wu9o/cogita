# Cogita 文档站点

这是 Cogita 仓库内的技术使用手册站点，不承载个人博客文章。文档内容位于 [`content/`](./content/)；站点使用独立的 `@cogita/theme-docs` 主题，并通过 `contentDir` 接入 Core 的普通 Markdown 内容能力。

## 本地构建

```bash
pnpm --filter docs-site build
pnpm --filter docs-site dev
```

文档入口：[在线使用手册](https://wu9o.github.io/cogita/) · [内容总览源码](./content/overview.md)。
