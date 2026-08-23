# @cogita/theme-editorial

Editorial 是 Cogita 的内容优先博客主题，面向技术写作、个人博客和小型知识出版物。

## 设计方向

- 使用页面底色、内容表面和主推内容背景建立层次；
- 首页突出主推文章和最近更新；
- 文章页保留 Rspress 的 Markdown 能力，同时强化阅读宽度和文章导航；
- 文章页自动补充封面、元信息、标签和相关推荐；
- 搜索、归档、标签、分类和合集使用统一的内容索引样式；
- 不改变插件的数据职责，主题只负责页面呈现。

## 使用方式

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: 'editorial',
});
```

## 主题配置

Editorial 的可选配置放在 `themeConfig.editorial` 下：

```ts
export default defineConfig({
  theme: 'editorial',
  themeConfig: {
    editorial: {
      heroEyebrow: 'My Journal',
      heroCopy: '记录工程实践和长期思考。',
      // 可填写文章 route，例如 /posts/introducing-cogita
      featuredPost: '/posts/introducing-cogita',
      relatedPosts: {
        enabled: true,
        limit: 3,
      },
    },
  },
});
```

也可以直接填写主题包名：

```ts
export default defineConfig({
  theme: '@cogita/theme-editorial',
});
```

## 本地开发

```bash
pnpm --filter @cogita/theme-editorial build
pnpm run build:packages
pnpm --filter blog build
```
