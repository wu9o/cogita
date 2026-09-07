# @cogita/plugin-i18n

Lightweight locale-aware UI copy for Cogita themes and third-party components. The plugin injects a message dictionary at build time and renders a language switcher when more than one locale is configured. Markdown content remains a site-level choice and should be authored or built as localized content separately.

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

When two or more message dictionaries are configured, the plugin adds a small global language switcher. The selected locale is stored in the browser and mirrored in the `lang` query parameter so a preview can be shared.

Set `showSwitcher: false` when the host theme already renders a native locale menu, such as an Rspress documentation site. For a site that publishes localized content incrementally, set `contentFallback: true` together with the Rspress `locales` config. Missing localized Markdown routes then reuse the default-language source until a file such as `content/zh-CN/guides/intro.md` is added. Existing localized files always win over the fallback route.

Locale resolution checks the full identifier first (for example, `en-US`), then the language prefix (for example, `en`), and finally `fallbackLocale`. When no message is found, the caller-provided fallback is used, so older sites remain safe when the plugin is not enabled.

The content fallback only keeps locale routes reachable; it does not claim that the fallback page is translated. Article titles, Markdown, and user-provided metadata remain site-level content.
