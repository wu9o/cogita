# Cogita

[English](./README.md)

基于 Rspress 的开箱即用静态博客系统，为想要快速搭建和定制博客的开发者而设计。

[![npm version](https://badge.fury.io/js/@cogita%2Fcore.svg)](https://badge.fury.io/js/@cogita%2Fcore)
[![GitHub](https://img.shields.io/github/license/wu9o/cogita)](https://github.com/wu9o/cogita/blob/main/LICENSE)

## ✨ 特性

- 🚀 **开箱即用**: 零配置快速开始
- 🎨 **高度定制**: 基于插件的架构，易于定制
- 📱 **响应式设计**: 移动优先的现代化 UI
- ⚡ **高性能**: 基于 Rspress 构建，性能卓越
- 🔍 **SEO 友好**: 内置 SEO 优化
- 📝 **Markdown 支持**: 完整的 Markdown 支持和扩展
- 🏷️ **标签分类**: 高效组织你的文章
- 🔗 **RSS 和站点地图**: 内置订阅源生成
- 🌙 **深色模式**: 自动深色/浅色主题切换

## 🚀 快速开始

### 使用 CLI（推荐）

```bash
# 创建新博客（即将推出）
npx create-cogita-blog my-blog --template tech-blog

# 进入目录
cd my-blog

# 启动开发服务器
npm run dev

# 部署到 GitHub Pages
npm run deploy
```

### 手动设置

```bash
# 克隆仓库
git clone https://github.com/wu9o/cogita.git
cd cogita

# 安装依赖
pnpm install

# 启动开发
pnpm run dev
```

## 📦 包列表

### 核心包
- **@cogita/core** - 核心博客系统（即将推出）
- **@cogita/theme-blog** - 默认博客主题（即将推出）
- **@cogita/create-cogita-blog** - CLI 脚手架工具（即将推出）

### 插件
- **[@cogita/plugin-posts-frontmatter](./packages/plugin-posts-frontmatter)** - 文章 frontmatter 管理 ✅
- **@cogita/plugin-blog-list** - 博客列表和分页（计划中）
- **@cogita/plugin-tags** - 标签系统（计划中）
- **@cogita/plugin-categories** - 分类系统（计划中）
- **@cogita/plugin-rss** - RSS 订阅生成（计划中）
- **@cogita/plugin-sitemap** - 站点地图生成（计划中）
- **@cogita/plugin-search** - 本地搜索功能（计划中）
- **@cogita/plugin-comments** - 评论系统集成（计划中）
- **@cogita/plugin-analytics** - 统计分析集成（计划中）

## 🎨 模板

- **minimal** - 简洁设计（计划中）
- **tech-blog** - 技术博客模板（计划中）
- **personal** - 个人博客模板（计划中）

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

# 构建特定插件
pnpm run build:plugin

# 启动博客开发
pnpm run dev

# 运行测试
pnpm run test
```

## 🗺️ 开发路线图

### 第一阶段：核心基础（当前）
- [x] 项目架构搭建
- [x] plugin-posts-frontmatter
- [ ] @cogita/core 包
- [ ] @cogita/theme-blog
- [ ] create-cogita-blog CLI

### 第二阶段：插件生态
- [ ] 博客列表和分页
- [ ] 标签和分类系统
- [ ] RSS 订阅生成
- [ ] 站点地图生成

### 第三阶段：高级功能
- [ ] 本地搜索功能
- [ ] 评论系统集成
- [ ] 统计分析集成
- [ ] 多模板支持

### 第四阶段：生态发展
- [ ] 文档网站
- [ ] 社区插件
- [ ] 主题市场

## 🤝 贡献

欢迎贡献！请查看我们的[贡献指南](./CONTRIBUTING.md)了解详情。

## 📄 许可证

MIT © [wu9o](https://github.com/wu9o)

## 🔗 相关链接

- [GitHub 仓库](https://github.com/wu9o/cogita)
- [问题反馈](https://github.com/wu9o/cogita/issues)
- [Rspress 文档](https://rspress.dev/)