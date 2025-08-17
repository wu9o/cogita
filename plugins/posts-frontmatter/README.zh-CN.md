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

### 1. 在 rspress.config.ts 中配置插件

```typescript
import { defineConfig } from '@rspress/core';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';

export default defineConfig({
  plugins: [
    pluginPostsFrontmatter({
      postsDir: '/path/to/your/posts',
      routePrefix: 'blog' // 可选，默认为 'posts'
    })
  ]
});
```

### 2. 配置 TypeScript 类型支持

在你的项目根目录的 `tsconfig.json` 或 `env.d.ts` 文件中添加类型引用：

```typescript
/// <reference types="@cogita/plugin-posts-frontmatter/client" />
```

或者在你的 `env.d.ts` 文件中：

```typescript
import '@cogita/plugin-posts-frontmatter/client';
```

### 3. 在组件中使用

```typescript
import { allPosts } from 'virtual-posts-data';

export function BlogList() {
  return (
    <div>
      {allPosts.map(post => (
        <div key={post.route}>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <p>创建时间: {post.createDate}</p>
        </div>
      ))}
    </div>
  );
}
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