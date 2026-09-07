---
title: 主题开发指南
---

# 主题开发指南

主题包负责页面布局、主题样式和主题级插件声明，不应在布局组件中重新实现文章扫描、评论或搜索等业务逻辑。

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
    pageLayouts: { home: './layouts/Home.js' },
    plugins: [],
  };
}
~~~

主题只声明能力。插件工厂负责校验自己的配置，主题通过 `plugins` 声明所需插件；Core 负责校验主题首页布局和插件布局契约。

## 发布和消费

主题包应有自己的 `package.json`、构建配置和版本。消费者直接安装该包并引用包名。Core 不绑定特定主题，因此生态可以扩展而不需要持续修改框架 Core。

可以复制[主题模板](https://github.com/wu9o/cogita/tree/main/starters/theme)获取可运行骨架。模板包含 `pageLayouts.home`、React 布局、全局样式和独立包构建配置。

## 验证主题

~~~bash
pnpm --filter @cogita/theme-my-theme build
pnpm run build:packages
pnpm exec cogita build
~~~

完整契约请参考 [API 参考](./api/api-reference.md) 和[插件 API 规范](./plugins/plugin-api-specification.md)。
