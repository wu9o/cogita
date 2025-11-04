# @cogita/core

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**中文** | [English](./README.en.md)

> 智能编排 Cogita 主题驱动架构的核心引擎

## 这是什么？

`@cogita/core` 是 Cogita 框架的大脑。它自动加载主题、管理插件，并提供类型安全的配置系统，让构建博客就像选择主题一样简单。

## 核心特性

- 🎨 **主题驱动**：主题自动加载所需的插件
- ⚙️ **类型安全**：完整的 TypeScript 支持和智能默认值
- 🔧 **零配置**：开箱即用，需要时可自定义
- ⚡ **Rspress 驱动**：基于快速现代的 Rspress 基础

## 快速开始

### 安装

```bash
pnpm add @cogita/core @cogita/theme-lucid
```

### 基础使用

创建 `cogita.config.ts`：

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '使用 Cogita 构建的博客',
  },
  theme: 'lucid', // 主题处理其他一切！
});
```

在 `posts/hello.md` 中创建第一篇文章：

```markdown
---
title: "你好，Cogita！"
createDate: "2024-01-01"
---

# 欢迎来到我的博客！
```

启动开发服务器：

```bash
pnpm dev
```

就这样！你的博客已经在 `http://localhost:3000` 准备好了。

## 工作原理

1. **加载配置**：读取你的 `cogita.config.ts`
2. **加载主题**：自动加载指定的主题
3. **注册插件**：主题声明其插件依赖
4. **生成配置**：创建优化的 Rspress 配置
5. **构建/服务**：使用 Rspress 为你的博客提供动力

## 配置

### 基础站点配置

```typescript
export default defineConfig({
  site: {
    title: '我的博客',              // 站点标题
    description: '我的精彩博客',     // 元描述
    base: '/blog/',               // 基础 URL（子路径）
  },
  theme: 'lucid',                // 主题名称
});
```

### 高级配置

```typescript
export default defineConfig({
  site: { /* ... */ },
  theme: 'lucid',
  
  // 透传给 Rspress 主题配置
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' },
    ],
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/you' }
    ],
  },
  
  // 透传给 Rspress 构建配置
  builderConfig: {
    output: { assetPrefix: 'https://cdn.example.com/' }
  },
});
```

## API 参考

### `defineConfig(config: CogitaConfig)`

类型安全的配置助手。

### `loadCogitaConfig(root?: string)`

从项目目录加载配置。

### 主要类型

```typescript
interface CogitaConfig {
  site?: {
    title?: string;
    description?: string; 
    base?: string;
  };
  theme?: string;
  themeConfig?: any;    // Rspress 主题配置
  builderConfig?: any;  // Rspress 构建配置
}
```

## 可用主题

- **`lucid`**（默认）- 简洁、专注内容的博客主题
- 更多主题即将推出...

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 了解更多

- 📖 [完整文档](../../docs/README.md)
- 🔧 [API 参考](../../docs/api-reference.md)
- 🏗️ [架构指南](../../docs/architecture-design.md)
- 💡 [最佳实践](../../docs/best-practices.md)
- 🎨 [主题开发](../../docs/theme-development.md)

## 相关包

- [🚀 @cogita/cli](../cli) - 命令行界面
- [🎨 @cogita/ui](../ui) - UI 组件库
- [🌟 @cogita/theme-lucid](../../themes/lucid) - 默认主题

## 许可证

MIT © [wu9o](https://github.com/wu9o)