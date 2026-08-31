---
title: 主题开发指南
---

# 主题开发指南

主题包负责页面布局、主题样式和主题级插件声明。它不应该在布局组件中重新实现文章扫描、评论或搜索等业务逻辑。

## 主题包结构

~~~text
themes/my-theme/
├── package.json
└── src/
    ├── index.ts
    ├── layouts/
    │   └── Home.tsx
    └── theme.css
~~~

## 导出主题配置

~~~ts
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-my-theme',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    plugins: [],
  };
}
~~~

主题包只负责声明能力。插件工厂负责校验自己的配置，主题通过 `plugins` 声明需要的插件；Core 会校验主题首页和插件声明的布局契约。

## 发布与消费

主题包应拥有独立的 `package.json`、构建配置和版本。消费方项目直接安装主题包，并在配置中使用包名。Core 不再绑定某个具体主题，这保证了主题数量增长时不会持续修改框架核心。

如果希望从可运行骨架开始，可以复制仓库中的[主题 starter](https://github.com/wu9o/cogita/tree/main/starters/theme)。它已经包含 `pageLayouts.home`、React 布局、全局样式和独立包构建配置。

## 验证主题

~~~bash
pnpm --filter @cogita/theme-my-theme build
pnpm run build:packages
pnpm exec cogita build
~~~

更完整的接口说明请参考 [API 参考](./api/api-reference.md) 和 [插件 API 规范](./plugins/plugin-api-specification.md)。
