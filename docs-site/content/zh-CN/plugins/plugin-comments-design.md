# 评论插件设计

## 目标

`@cogita/plugin-comments` 为文章页提供可选的第三方评论区接入能力，一期支持 Giscus 和 Utterances：前者使用 GitHub Discussions，后者使用 GitHub Issues。

插件不引入数据库、不在构建期访问 GitHub API，也不把提供商脚本打包进 Cogita。只有站点显式启用且配置校验通过时，Lucid 才会在文章页动态加载对应脚本。

## 配置边界

```ts
comments: {
  enabled: true,
  provider: 'giscus',
  title: '评论',
  giscus: {
    repo: 'owner/public-repo',
    repoId: '...',
    category: 'Announcements',
    categoryId: '...',
    mapping: 'pathname',
  },
}
```

- `enabled` 默认关闭，避免未完成 GitHub 配置时意外加载第三方脚本。
- Giscus 必须配置公开仓库、仓库 ID、Discussion 分类和分类 ID。
- Utterances 必须配置公开仓库；`issueTerm: 'specific'` 时还必须配置 `term`。
- 配置不完整时插件警告并保持关闭，不阻断博客构建。

## 数据流与隐私

```text
cogita.config.ts → 核心默认配置 → virtual-comments-data
→ Lucid 判断文章路由 → 动态加载 Giscus / Utterances
```

虚拟模块只包含最终配置和文章路由列表，不包含 GitHub Token、评论内容或本地文件路径。第三方脚本仅在评论启用的文章页加载，授权由提供商和 GitHub OAuth 处理；加载失败时主题显示可访问的错误状态。

## 示例站点

Knowledge 示例站点绑定公开评论仓库 [`wu9o/cogita-comments`](https://github.com/wu9o/cogita-comments)，使用 `General` Discussions 分类。首次启用前还需要安装 [Giscus GitHub App](https://github.com/apps/giscus)。

## 后续建设

- 跟随站点明暗主题切换 Giscus / Utterances 主题；
- 完善加载失败提示；
- 逐一评估更多评论提供商的费用、隐私和脚本稳定性。
