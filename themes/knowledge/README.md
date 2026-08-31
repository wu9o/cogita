# @cogita/theme-knowledge

面向知识库、个人 Wiki 和技术研究站点的 Cogita 主题。

主题默认组合以下能力：

- 统一文章与 `contentDir` 文档索引；
- 本地搜索；
- 标签聚合；
- 内容出链与反向链接；
- 可选的统一内容质量诊断；
- 首页内容探索、搜索页和标签页。

```bash
pnpm add -D @cogita/cli @cogita/core @cogita/theme-knowledge
```

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的知识库',
    description: '连接文章、文档和长期积累的知识。',
  },
  posts: { dir: 'posts', routePrefix: 'posts' },
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
```

搜索、标签和内容关系默认启用；站点仍可以通过 `search`、`tags` 和
`contentRelations` 配置覆盖路由或关闭对应能力。显式配置 `contentCheck` 后，主题会对文章和普通文档共同生成内容质量报告。
