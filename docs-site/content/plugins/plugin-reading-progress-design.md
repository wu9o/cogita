# Reading progress plugin design

## Goal

`@cogita/plugin-reading-progress` provides article reading support:

1. Estimate reading time at build time.
2. Show a progress bar and live percentage on article pages.
3. Let the theme highlight the active table-of-contents entry as the reader scrolls.
4. Optionally remember and restore the reading position in the local browser.

The plugin does not add third-party analytics or modify Markdown files. Position memory is off by default and, when enabled, writes only to the current browser's `localStorage`.

## Configuration

```ts
readingProgress: {
  enabled: true,
  showBar: true,
  showReadingTime: true,
  showTocProgress: true,
  rememberPosition: false,
  wordsPerMinute: 300,
  includeCode: false,
}
```

- `enabled`: when off, the plugin still provides an empty runtime module; the theme skips the enhancement UI without a build failure.
- `showBar`: controls the fixed article-top progress bar.
- `showReadingTime`: controls the estimated reading time and live percentage.
- `showTocProgress`: highlights the current heading and sets `aria-current="location"`.
- `rememberPosition`: restores the scroll position by article route; off by default.
- `wordsPerMinute`: the reading unit per minute; Chinese is estimated by characters and English by words.
- `includeCode`: includes fenced code blocks in the estimate when enabled.

Core supplies defaults so the default theme can safely consume the virtual module. A custom theme can disable the plugin explicitly. When disabled, the plugin does not scan posts and emits empty statistics plus a closed state, preserving both opt-out behavior and safe static imports.

## Build-time data

The plugin scans Markdown and MDX files under `posts.dir` and produces:

```ts
interface ReadingStats {
  title: string;
  route: string;
  wordCount: number;
  readingTimeMinutes: number;
  createDate: string;
  updateDate: string;
}
```

It removes frontmatter, link URLs, HTML tags, heading markers, and code blocks unless `includeCode` is enabled. The result is at least one minute so short posts never display zero minutes.

## Virtual module

`virtual-reading-progress-data` exposes:

- `readingProgressConfig`;
- `readingStatsByRoute`;
- `getReadingStats(route)`.

The module contains only runtime data. It does not expose local absolute paths or article bodies.

## Theme boundary

Lucid's global UI reads the statistics for the current article URL:

- article pages show the progress bar and reading time;
- scrolling highlights the visible heading in desktop and mobile tables of contents and sets `aria-current="location"`;
- position memory restores the scroll location when enabled and provides a back-to-top action;
- home, tag, category, and archive routes do not show reading enhancements;
- progress uses the current document's scroll height and makes no network requests.

## Future work

- static reading-time metadata in the article header;
- section-level progress;
- cooperation with a privacy-friendly reading analytics plugin.

For the Chinese version, see [阅读进度插件设计](../zh-CN/plugins/plugin-reading-progress-design.html).
