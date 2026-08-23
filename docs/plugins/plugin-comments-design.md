# 评论插件设计

## 目标

`@cogita/plugin-comments` 为文章页提供可选的第三方评论区接入能力，一期支持两个不需要单独购买评论服务的 GitHub 方案：

- Giscus：使用 GitHub Discussions 保存评论和反应。
- Utterances：使用 GitHub Issues 保存评论。

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

- `enabled` 默认关闭，避免用户未完成 GitHub 配置时意外加载第三方脚本。
- Giscus 必须配置公开仓库、仓库 ID、Discussion 分类和分类 ID。
- Utterances 必须配置公开仓库；`issueTerm: 'specific'` 时还必须配置 `term`。
- 配置不完整时插件发出警告并保持关闭，不阻断博客构建。

## 数据流

```text
cogita.config.ts
       ↓
核心层补齐 comments 默认配置
       ↓
评论插件扫描文章路由并生成 virtual-comments-data
       ↓
Lucid 全局组件判断当前是否为文章页
       ↓
按 provider 动态加载 Giscus / Utterances 脚本
```

虚拟模块只包含最终配置和文章路由列表，不包含 GitHub Token、评论内容或本地文件路径。

## 安全与隐私

- 第三方脚本仅在文章页且评论功能启用时加载。
- 插件不保存用户行为，不实现自有追踪逻辑。
- 评论授权由 Giscus / Utterances 和 GitHub OAuth 处理，Cogita 不接触用户凭据。
- `enabled: false` 时页面不产生第三方脚本标签。
- 第三方脚本加载失败时，主题显示可访问的错误状态，不留下无提示的空白区域。

## Cogita 示例站点配置

当前示例站点已绑定公开评论仓库 [`wu9o/cogita-comments`](https://github.com/wu9o/cogita-comments)，并使用 `General` Discussions 分类：

- 仓库 ID：`R_kgDOUBWpKg`
- 分类 ID：`DIC_kwDOUBWpKs4DEALB`
- 页面映射：`pathname`

仓库已开启 Discussions。首次启用评论前，还需要在该仓库安装 [Giscus GitHub App](https://github.com/apps/giscus)，否则评论框可能无法创建对应 Discussion。

## 后续建设

- 跟随站点明暗主题自动切换 Giscus / Utterances 主题。
- 评论区加载失败时的可访问提示。
- 更多评论提供商适配，但需要逐一评估费用、隐私和脚本稳定性。
