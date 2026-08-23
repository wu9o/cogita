# 阅读进度插件设计

## 目标

`@cogita/plugin-reading-progress` 为文章页提供两个基础阅读体验能力：

1. 构建期估算每篇文章的阅读时间。
2. 运行时在文章页显示阅读进度条和实时百分比。

本期不引入第三方分析、不保存用户阅读位置，也不把阅读进度逻辑写入 Markdown 页面文件。

## 配置

```ts
readingProgress: {
  enabled: true,
  showBar: true,
  showReadingTime: true,
  wordsPerMinute: 300,
  includeCode: false,
}
```

- `enabled`：关闭后插件仍提供空运行时模块，主题会跳过阅读增强 UI，确保关闭配置不会造成构建失败。
- `showBar`：控制文章顶部的固定进度条。
- `showReadingTime`：控制右下角预计阅读时长和实时百分比。
- `wordsPerMinute`：每分钟阅读单位数，中文按字符、英文按单词估算。
- `includeCode`：是否把 fenced code block 纳入估算。

核心层提供默认配置，保证默认主题可以安全消费虚拟模块；自定义主题仍可通过配置关闭插件。显式关闭时，插件不扫描文章，只生成空统计数据和关闭状态，兼顾按需关闭与主题静态导入的稳定性。

## 构建期数据

插件扫描 `posts.dir` 下的 Markdown/MDX 文件，生成：

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

正文处理会移除 frontmatter、链接地址、HTML 标签、标题标记和代码块（除非显式开启 `includeCode`）。统计结果至少为 1 分钟，避免短文显示为 0 分钟。

## 虚拟模块

`virtual-reading-progress-data` 提供：

- `readingProgressConfig`
- `readingStatsByRoute`
- `getReadingStats(route)`

虚拟模块只暴露运行时需要的数据，不泄露文章的本地绝对路径和正文内容。

## 主题边界

Lucid 通过全局 UI 组件读取当前 URL 对应的文章统计：

- 文章页显示进度条和阅读时间。
- 文章滚动时，根据当前可见标题高亮右侧目录项，并为当前目录项设置 `aria-current="location"`。
- 首页、标签页、分类页、归档页等非文章路由不显示阅读增强 UI。
- 进度基于当前文档滚动高度计算，不发送任何网络请求。

## 后续建设

- 文章头部的静态阅读时间元信息。
- 章节级进度。
- 可选的阅读位置记忆。
- 与隐私友好的阅读行为分析插件协作。
