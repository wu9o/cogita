# @cogita/plugin-reading-progress

为文章页生成预计阅读时间和阅读进度所需的数据。插件在构建阶段读取文章 Markdown，移除 frontmatter 与 Markdown 标记后，按中文字符和英文单词估算阅读单位。

## 配置

```ts
export default defineConfig({
  readingProgress: {
    enabled: true,
    showBar: true,
    showReadingTime: true,
    wordsPerMinute: 300,
    includeCode: false,
  },
});
```

插件通过 `virtual-reading-progress-data` 暴露最终配置和按文章路由索引的阅读统计。主题负责决定进度条、阅读时间和目录联动的视觉呈现，插件本身不依赖具体主题。

将 `enabled` 设为 `false` 后，插件不会扫描文章，主题也不会渲染阅读增强 UI，但仍会提供关闭状态的空运行时模块，保证主题安全构建。
