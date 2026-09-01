# __SITE_TITLE__

这是一个由 Cogita `knowledge-external` 模板生成的知识库站点。
它把站点文章、本地手册和独立 Git Markdown 内容仓库统一接入搜索、标签、内容关系和静态页面。

## 本地开发

```bash
pnpm install
pnpm run doctor
pnpm run dev
```

外部内容放在 `git-content/`，其中文件会映射到 `/notes/`。本地可以直接把内容仓库 checkout 到这个目录；模板自带的 `.gitkeep` 只用于保证首次构建目录存在。

## GitHub Pages

模板已经包含 `.github/workflows/deploy.yml`。在站点仓库中配置：

- Repository variable：`COGITA_CONTENT_REPOSITORY`，例如 `your-org/your-notes`；
- 可选 Repository variable：`COGITA_CONTENT_REF`，用于固定分支、标签或 commit；
- 私有内容仓库需要 Repository secret：`COGITA_CONTENT_TOKEN`。

如果站点部署在 `https://example.github.io/repository/`，请把 `cogita.config.ts` 中的 `site.base` 和 `site.url` 改成对应路径，再提交生成的 `pnpm-lock.yaml`。

工作流会先 checkout 站点，再把外部内容仓库 checkout 到 `git-content/`，最后执行 `pnpm exec cogita build` 并发布 `doc_build/`。
