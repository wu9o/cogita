# @cogita/plugin-i18n

Lightweight locale-aware UI copy for Cogita themes and third-party components. The plugin injects a message dictionary at build time; it does not translate Markdown content. Content language remains a site-level choice.

## Usage

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

Themes and plugins can import `virtual-cogita-i18n-text`:

```ts
import { t } from 'virtual-cogita-i18n-text';

const label = t('knowledge.home.search', 'Search knowledge');
```

Locale resolution checks the full identifier first (for example, `en-US`), then the language prefix (for example, `en`), and finally `fallbackLocale`. When no message is found, the caller-provided fallback is used, so older sites remain safe when the plugin is not enabled.
