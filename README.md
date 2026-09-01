# Cogita

[**中文文档**](./docs-site/content/overview.md) • [English Documentation](./README.en.md)

📖 [在线使用手册](https://wu9o.github.io/cogita/)

一个基于 Rspress 的**主题驱动静态站点框架**，专为希望快速搭建和定制内容站点的开发者设计。

先看真实效果：[主题 Demo 总览](https://wu9o.github.io/cogita/demos/) · [在线使用手册](https://wu9o.github.io/cogita/)

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
- 🔎 **真实 Demo**: 四个独立站点消费者，直接展示主题接入和内容组织方式

## 🚀 快速开始

### 最快路径：用模板启动

如果你想先得到一个能运行的站点，直接选择模板：

```bash
pnpm dlx @cogita/cli create my-site --template knowledge
cd my-site
pnpm dev
```

可用模板包括 `blog`、`docs`、`knowledge` 和 `knowledge-external`。其中 `knowledge-external` 用于把 JSON 或 Git 内容源接入知识库。

### 自定义配置：三步启动站点

```bash
# 1. 安装依赖
pnpm add -D @cogita/cli @cogita/core @cogita/theme-lucid

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
  theme: "@cogita/theme-lucid",
});' > cogita.config.ts

# 3. 创建第一篇文章
mkdir posts && echo '---
title: "Hello Cogita"
date: "2025-01-01"
---

# 欢迎使用 Cogita

开始你的博客之旅！' > posts/hello.md

# 启动开发服务器
pnpm exec cogita dev
```

### 📦 生态系统

**核心包：**
- [`@cogita/core`](./packages/core) - 智能核心引擎
- [`@cogita/cli`](./packages/cli) - 命令行工具  
- [`@cogita/theme-lucid`](./themes/lucid) - 实践博客主题
- [`@cogita/theme-editorial`](./themes/editorial) - 编辑型内容主题
- [`@cogita/theme-docs`](./themes/docs) - 技术文档主题
- [`@cogita/theme-knowledge`](./themes/knowledge) - 长期知识库主题
- [`@cogita/plugin-i18n`](./plugins/i18n) - 英文优先的界面文案国际化
- [`@cogita/plugin-rss`](./plugins/rss) - RSS 订阅插件
- [`@cogita/plugin-seo`](./plugins/seo) - SEO、Open Graph 和 Twitter Card 元数据
- [`@cogita/plugin-content-source-json`](./plugins/content-source-json) - JSON 内容源
- [`@cogita/plugin-content-source-git`](./plugins/content-source-git) - Git Markdown 内容源

**完整文档：** [📖 在线使用手册](https://wu9o.github.io/cogita/) • [📚 文档源码](./docs-site/content/overview.md) • [🗺️ 包与能力地图](./docs-site/content/package-map.md) • [📄 English Documentation](./README.en.md)

### 🎭 主题 Demo

仓库提供四个彼此独立的主题 Demo，每个 Demo 都有自己的配置和自定义内容，可直接查看主题如何接入：

```bash
pnpm install
pnpm run demo
```

打开 <http://localhost:3100/> 查看主题总览，或阅读 [`demos/README.md`](./demos/README.md) 了解单独启动方式。Demo 不使用 `blog/` 中的内容，适合贡献者和 GitHub 访客快速体验 Docs、Lucid、Editorial 与 Knowledge。

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

# 启动框架使用手册
pnpm run dev

# 代码检查
pnpm run check
```

## 🗺️ 当前发展方向

- **✅ 核心基础**：主题驱动架构、配置流和插件系统已经完成。
- **🚧 产品化与长期采用**：持续收口公共契约、升级诊断、独立站点部署和第三方扩展边界。
- **📋 需求驱动扩展**：在现有契约稳定后，再根据真实站点需求增加主题和插件。

详细路线图请查看 [ROADMAP.md](./ROADMAP.md)

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)

## 📄 许可证

MIT © [wu9o](https://github.com/wu9o)

---

<div align="center">

**🌟 如果 Cogita 对你有帮助，请给我们一个 Star！**

*让更多开发者发现这个优雅的博客解决方案*

[⭐ Star this project](https://github.com/wu9o/cogita) • [📖 在线手册](https://wu9o.github.io/cogita/) • [💬 加入讨论](https://github.com/wu9o/cogita/discussions)

</div>
