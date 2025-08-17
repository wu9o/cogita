# @cogita/plugin-posts-frontmatter

[English](./README.md)

一个用于 Rspress 的插件，用于提取和提供所有文章的 frontmatter 数据，支持虚拟模块。

[![npm version](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter.svg)](https://badge.fury.io/js/@cogita%2Fplugin-posts-frontmatter)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## 安装

```bash
npm install @cogita/plugin-posts-frontmatter
```

## 使用

本插件旨在与 Cogita 框架无缝协作，并由需要它的主题（例如 `@cogita/theme-lucid`）自动集成。

对于绝大多数用户来说，**无需手动安装或配置**。只需使用一个兼容的 Cogita 主题，本插件即可开箱即用。

### 工作原理

当在 Cogita 主题中使用时，主题会向 `@cogita/core` 表明此插件是一个依赖项。接着，核心会自动初始化该插件，并向其提供必要的配置以找到你的文章（通常在 `posts/` 目录下）。

然后，插件会扫描所有 Markdown 文件，提取其 frontmatter，并创建一个名为 `virtual-posts-data` 的虚拟模块，该模块导出一个 `allPosts` 数组。主题组件随后可以导入这些数据来渲染文章列表、归档等。

### TypeScript 支持

我们为虚拟模块提供了客户端的类型定义。要启用它们，请将以下引用添加到你项目的 `tsconfig.json` 或 `.d.ts` 文件中：

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

### 高级用法 (手动配置)

如果你希望在一个标准的 Rspress 项目中（在 Cogita 框架之外）使用此插件，你可以手动在 `rspress.config.ts` 中进行配置：

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    // 插件函数现在接收完整的配置对象
    (config) => pluginPostsFrontmatter({
      ...config,
      postsDir: '/path/to/your/posts', // 指定文章目录
      routePrefix: 'blog' // 可选，默认为 'posts'
    })
  ]
});
```

## API

### PostFrontmatter

```typescript
interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
}
```

### PluginOptions

```typescript
interface PluginOptions {
  postsDir: string;      // 存放文章的目录的绝对路径
  routePrefix?: string;  // 生成路由时使用的前缀，默认为 'posts'
}
```

## 虚拟模块

插件会创建一个名为 `virtual-posts-data` 的虚拟模块，导出 `allPosts` 数组，包含所有文章的 frontmatter 数据。

## 开发

```bash
# 克隆仓库
git clone https://github.com/wu9o/cogita.git
cd cogita/packages/plugin-posts-frontmatter

# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT © [wu9o](https://github.com/wu9o)

## 相关链接

- [GitHub 仓库](https://github.com/wu9o/cogita)
- [问题反馈](https://github.com/wu9o/cogita/issues)
- [Rspress 官方文档](https://rspress.dev/)