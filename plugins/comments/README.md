# @cogita/plugin-comments

为 Cogita 文章页接入 Giscus 或 Utterances 评论区。插件只负责配置校验、文章路由识别和运行时配置注入，主题负责加载对应的第三方脚本。

## 配置示例

### Giscus

```ts
export default defineConfig({
  comments: {
    enabled: true,
    provider: 'giscus',
    title: '评论',
    giscus: {
      repo: 'your-name/your-public-repo',
      repoId: 'R_kgDOxxxxxx',
      category: 'Announcements',
      categoryId: 'DIC_kwDOxxxxxx',
      mapping: 'pathname',
      reactionsEnabled: true,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'zh-CN',
    },
  },
});
```

### Utterances

```ts
export default defineConfig({
  comments: {
    enabled: true,
    provider: 'utterances',
    utterances: {
      repo: 'your-name/your-public-repo',
      issueTerm: 'pathname',
      label: 'comment',
      theme: 'github-light',
    },
  },
});
```

两种服务都要求使用公开 GitHub 仓库，并由站点所有者安装对应 App。评论数据保存在 GitHub Discussions 或 Issues 中，插件本身不创建数据库，也不引入评论 SDK 依赖。

将 `enabled` 设为 `false` 后，插件不会加载第三方脚本，但仍提供关闭状态的空运行时模块，保证主题可以安全构建。
