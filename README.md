# Cogita

[**中文文档**](#) • [English Documentation](./README.en.md)

一个基于 Rspress 的**开箱即用**静态博客系统，专为想要快速搭建和定制博客的开发者设计。

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)
[![CI](https://github.com/wu9o/cogita/workflows/CI/badge.svg)](https://github.com/wu9o/cogita/actions/workflows/ci.yml)

## ✨ 核心特性

- 🚀 **真正开箱即用**: 零配置启动，数秒内拥有功能完备的博客
- 🎨 **主题驱动架构**: 主题不仅是皮肤，更是完整的功能生态系统
- 🔧 **渐进增强**: 从零配置到完全自定义的平滑过渡体验
- ⚡ **高性能**: 基于现代化 Rspress 框架，构建速度极快
- 📝 **Markdown 优先**: 纯粹的 Markdown 写作体验，专注内容创作
- 🛡️ **类型安全**: 完整的 TypeScript 支持，开发体验卓越

## 🚀 快速开始

### 三步启动博客

```bash
# 1. 安装依赖
pnpm add @cogita/core @cogita/theme-lucid

# 2. 创建配置文件 cogita.config.ts
echo 'import { defineConfig } from "@cogita/core";

export default defineConfig({
  site: {
    title: "我的博客",
    description: "记录思考与成长",
    url: "https://yourdomain.com",
  },
  posts: { dir: "posts" },
  rss: { 
    title: "我的博客 RSS", 
    description: "最新文章订阅" 
  },
  theme: "lucid",
});' > cogita.config.ts

# 3. 创建第一篇文章
mkdir posts && echo '---
title: "Hello Cogita"
date: "2025-01-01"
---

# 欢迎使用 Cogita

开始你的博客之旅！' > posts/hello.md

# 启动开发服务器
pnpm dev
```

### 📦 生态系统

**核心包：**
- [`@cogita/core`](./packages/core) - 智能核心引擎
- [`@cogita/cli`](./packages/cli) - 命令行工具  
- [`@cogita/theme-lucid`](./themes/lucid) - 默认主题
- [`@cogita/plugin-rss`](./plugins/rss) - RSS 订阅插件
- [`@cogita/plugin-tags`](./plugins/tags) - 标签管理与标签云插件

**完整文档：** [📚 完整中文文档 (当前页面)](#) • [📄 English Documentation](./README.en.md)

## 🏗️ 技术架构

```
用户配置 → 框架核心 → 主题生态 → 插件体系 → UI组件 → Rspress
```

Cogita 采用**主题驱动架构**，主题自动加载所需插件，实现真正的开箱即用。

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build:packages

# 启动示例博客
pnpm run dev

# 代码检查
pnpm run check
```

## 🗺️ 发展路线图

- **✅ Phase 1**: 核心基础设施（已完成）
- **🚧 Phase 2**: 生态扩展（进行中）
- **📋 Phase 3**: 高级功能（规划中）

详细路线图请查看 [ROADMAP.md](./ROADMAP.md)

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)

## 📄 许可证

MIT © [wu9o](https://github.com/wu9o)

---

<div align="center">

**🌟 如果 Cogita 对你有帮助，请给我们一个 Star！**

*让更多开发者发现这个优雅的博客解决方案*

[⭐ Star this project](https://github.com/wu9o/cogita) • [🚀 快速开始](./docs/guides/development.md) • [💬 加入讨论](https://github.com/wu9o/cogita/discussions)

</div>
