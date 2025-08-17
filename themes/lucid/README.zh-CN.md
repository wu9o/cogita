# @cogita/theme-lucid

一个为 Cogita 设计的、清晰的、以内容为中心的博客主题。这是新 Cogita 项目的默认主题。

## 特性

-   干净、极简的设计
-   专注于可读性和排版
-   响应式与移动优先
-   可通过 CSS 自定义属性进行定制
-   使用 `@cogita/ui` 的组件构建

## 设计哲学

该主题旨在提供清晰、无障碍的阅读体验，让作者的思想 (`Cogito`) 得以清晰地 (`Lucid`) 呈现。

它既是一个开箱即用的、漂亮的、生产就绪的默认选项，也是一个极佳的定制化起点。

## 使用

该主题已默认被 `@cogita/core` 包含。如果您想显式地安装或配置它：

```bash
pnpm add @cogita/theme-lucid
```

然后，在您的 `cogita.config.ts` 中：

```ts
import { defineConfig } from 'cogita';

export default defineConfig({
  theme: '@cogita/theme-lucid',
  // ... 其他配置
});
```
