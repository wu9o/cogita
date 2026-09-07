---
title: i18n 插件
---

# i18n 插件

`@cogita/plugin-i18n` 提供主题无关的界面文案契约。翻译内容不放入 Core，官方主题和第三方主题都可以消费同一个运行时模块。

## 站点配置

~~~ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-knowledge',
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'knowledge.home.search': 'Search knowledge',
      },
    },
  },
});
~~~

插件先匹配完整 locale，再匹配语言前缀，最后使用配置的回退语言。缺少 key 时使用主题传入的回退文案，因此翻译不完整时站点仍可用。

## 主题契约

主题从 `virtual-cogita-i18n-text` 导入 `t`，并使用 `knowledge.home.search`、`lucid.search.title` 这类稳定的命名空间 key。回退文案应使用英文，让新站点在没有消息文件时仍然英文优先。

Rspress 已经拥有 `virtual-i18n-text`；Cogita 使用自己的命名空间模块，避免运行时模块冲突。

## 架构边界

插件只翻译界面文案。文章标题、Markdown 和用户提供的元数据属于内容，不会被重写。未来的内容本地化流程可以建立在这个契约之上，而不改变主题运行时行为。
