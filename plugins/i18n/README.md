# @cogita/plugin-i18n

为 Cogita 主题和第三方组件提供轻量的界面文案国际化能力。插件只负责构建期注入文案字典，不会自动翻译 Markdown 内容；内容语言仍由站点自己的内容组织决定。

## 使用

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: { title: 'My Knowledge Base', lang: 'en-US' },
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'knowledge.home.search': 'Search knowledge',
      },
      'zh-CN': {
        'knowledge.home.search': '搜索知识',
      },
    },
  },
  theme: '@cogita/theme-knowledge',
});
```

主题或插件可以导入 `virtual-cogita-i18n-text`：

```ts
import { t } from 'virtual-cogita-i18n-text';

const label = t('knowledge.home.search', 'Search knowledge');
```

语言会先匹配完整标识（例如 `en-US`），再匹配语言前缀（例如 `en`），最后按 `fallbackLocale` 回退。未找到文案时使用调用方传入的默认值，因此未启用插件的旧站点仍能安全运行。
