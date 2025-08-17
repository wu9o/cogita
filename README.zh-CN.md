# Cogita

[English](./README.md)

基于 Rspress 的开箱即用静态博客系统，为想要快速搭建和定制博客的开发者而设计。

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## ✨ 特性

- 🚀 **开箱即用**: 真正的零配置体验，在数秒内启动你的博客。
- 🎨 **主题驱动**: 主题不仅是皮肤；它们是自包含的生态系统，捆绑了所需的功能插件。
- 🔧 **可扩展**: Cogita 在开箱即用的同时，也允许你利用 Rspress 的全部配置能力进行深度定制。
- ⚡ **性能卓越**: 基于高性能的 Rspress 框架构建。
- 📝 **Markdown 中心**: 享受纯粹的、以 Markdown 为中心的写作体验。

## 💡 核心理念

Cogita 构建于“约定优于配置”的哲学之上，并采用独特的**主题驱动架构**。

- **主题即生态**: 在 Cogita 中，主题不仅仅是视觉层。它是一个完整的软件包，可以声明自己的插件依赖。当你选择一个主题时，Cogita 的核心会自动理解并注册该主题正常运作所需的所有插件（例如文章列表生成插件）。这提供了一种真正无缝的、开箱即用的体验。

- **配置透传**: Cogita 为博客场景提供了一个简洁的配置层，但它并未隐藏 Rspress 的强大功能。你可以通过 `cogita.config.ts` 文件直接访问和修改底层的 Rspress `themeConfig`，从而在不“弹出”的情况下实现高级定制。

## 🚀 快速开始

搭建一个 Cogita 博客极其简单。

1.  **安装依赖**:

    ```bash
    # 安装 Cogita 核心和你选择的主题
    pnpm add @cogita/core @cogita/theme-lucid
    ```

2.  **创建 `cogita.config.ts`**:

    在你的项目根目录创建一个 `cogita.config.ts` 文件：

    ```typescript
    import { defineConfig } from '@cogita/core';

    export default defineConfig({
      site: {
        title: 'Cogita, Ergo Sum | 我思，故我在',
        description: '在这里，我记录编码、创造与思考的瞬间。',
      },
      theme: 'lucid', // 指定主题
      
      // 直接配置 Rspress 的主题选项
      themeConfig: {
        socialLinks: [
          { 
            icon: 'github', 
            mode: 'link', 
            content: 'https://github.com/your-github' 
          },
        ],
      },
    });
    ```

3.  **创建你的第一篇文章**:

    创建一个 `posts` 目录，并添加你的第一篇 Markdown 文件，例如 `posts/hello-world.md`。

4.  **运行开发服务器**:

    将以下脚本添加到你的 `package.json` 中：
    ```json
    "scripts": {
      "dev": "cogita dev",
      "build": "cogita build"
    }
    ```
    然后，运行 `pnpm dev` 就能看到你的博客了！

## 📦 包列表

### 核心包
- **[@cogita/cli](./packages/cli)** - Cogita 框架的命令行界面 (CLI)。
- **[@cogita/core](./packages/core)** - 智能编排主题与插件的核心引擎。
- **[@cogita/ui](./packages/ui)** - Cogita 生态系统的共享、可主题化 UI 组件。
- **[@cogita/theme-lucid](./themes/lucid)** - 一个清晰、注重内容的 Cogita 博客主题。(默认主题)

### 插件
- **[@cogita/plugin-posts-frontmatter](./plugins/posts-frontmatter)** - 自动扫描文章、提取 frontmatter 并将其提供给主题使用。 ✅
- **@cogita/plugin-blog-list** - 博客列表和分页（计划中）
- **@cogita/plugin-tags** - 标签系统（计划中）
- **@cogita/plugin-categories** - 分类系统（计划中）
- **@cogita/plugin-rss** - RSS 订阅生成（计划中）
- **@cogita/plugin-sitemap** - 站点地图生成（计划中）
- **@cogita/plugin-search** - 本地搜索功能（计划中）
- **@cogita/plugin-comments** - 评论系统集成（计划中）
- **@cogita/plugin-analytics** - 统计分析集成（计划中）

## 📚 文档

- [快速开始](./docs/getting-started.md)（即将推出）
- [配置指南](./docs/configuration.md)（即将推出）
- [插件开发](./docs/plugin-development.md)（即将推出）
- [主题定制](./docs/theme-customization.md)（即将推出）

## 🏗️ 开发

这是一个使用 pnpm workspace 管理的 monorepo。

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build

# 启动用于开发的示例博客
pnpm run dev
```

## 🗺️ 开发路线图

我们的路线图专注于增强 Cogita 的稳定性、生态系统和用户体验。

### 第一阶段：核心基础 (当前)
- [x] **核心架构**: 实现了主题驱动的插件系统。
- [x] **Rspress 透传**: 开放了 `themeConfig` 的自定义能力。
- [x] **`@cogita/plugin-posts-frontmatter`**: 用于处理博客文章的核心插件。
- [x] **`@cogita/theme-lucid`**: 一个功能完备的默认主题。
- [ ] 完善并文档化插件 API。
- [ ] 添加全面的单元测试和集成测试。
- [ ] 改进错误处理和 CLI 反馈。

### 第二阶段：生态发展
- [ ] **官方插件**: 开发标签、分类和分页等基础插件。
- [ ] **更多主题**: 创建至少一个风格不同的官方主题。
- [ ] **文档建设**: 撰写官方文档网站。
- [ ] **社区模板**: 鼓励并展示社区开发的主题和插件。

### 第三阶段：高级功能
- [ ] 全文搜索集成。
- [ ] SEO 增强插件（站点地图、结构化数据）。
- [ ] 评论系统集成（Giscus 等）。
- [ ] i18n 支持，用于多语言博客。

## 🤝 贡献

欢迎贡献！请查看我们的[贡献指南](./CONTRIBUTING.md)了解详情。

## 📄 许可证

MIT © [wu9o](https://github.com/wu9o)

## 🔗 相关链接

- [GitHub 仓库](https://github.com/wu9o/cogita)
- [问题反馈](https://github.com/wu9o/cogita/issues)
- [Rspress 文档](https://rspress.dev/)
