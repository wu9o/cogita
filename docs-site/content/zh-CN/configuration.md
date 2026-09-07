---
title: 配置
---

# 配置

Cogita 将站点级决策集中放在 `cogita.config.ts` 中：主题负责展示边界，插件负责数据和构建能力。

## 最小配置

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的站点',
    description: '面向访客和搜索引擎的清晰站点描述。',
  },
  theme: '@cogita/theme-lucid',
});
```

## 英文优先的界面

所有内置主题都支持 `@cogita/plugin-i18n`。默认回退语言为英文，需要时再提供其他语言文案：

```ts
export default defineConfig({
  i18n: {
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': { 'lucid.home.search': 'Search articles' },
      'zh-CN': { 'lucid.home.search': '搜索文章' },
    },
  },
});
```

插件只负责主题和插件的界面文案，不会自动翻译 Markdown、文章标题或用户元数据。

## 配置边界

- `site` 描述站点品牌、语言和部署基础路径。
- `theme` 选择展示系统和主题声明的插件生态。
- `themeConfig` 保存主题专属的布局选项。
- `posts`、`search`、`rss` 和 `i18n` 等命名空间只配置对应能力。

## 构建

```bash
pnpm exec cogita build
pnpm exec cogita doctor --strict --json
```

部署前使用 doctor 检查包解析、主题契约、内容目录和构建入口。
