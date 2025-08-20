# @cogita/cli

[![npm version](https://badge.fury.io/js/@cogita%2Fcli.svg)](https://badge.fury.io/js/@cogita%2Fcli)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

**中文** | [English](./README.md)

> 用于创建和管理 Cogita 博客的命令行工具

## 这是什么？

`@cogita/cli` 提供了一套简单而强大的命令来创建、开发和构建 Cogita 博客项目。通过内置模板和开发工具，几秒钟即可开始。

## 安装

### 全局安装（推荐）

```bash
# 使用 pnpm
pnpm add -g @cogita/cli

# 使用 npm
npm install -g @cogita/cli

# 使用 yarn
yarn global add @cogita/cli
```

### 无需安装直接使用

```bash
npx @cogita/cli --help
```

## 快速开始

### 创建新博客

```bash
# 交互式创建
cogita create

# 指定名称创建
cogita create my-blog

# 使用模板创建
cogita create my-blog --template minimal
```

### 开发

```bash
# 启动开发服务器
cogita dev

# 自定义端口和主机
cogita dev --port 8080 --host 0.0.0.0
```

### 构建和部署

```bash
# 构建生产版本
cogita build

# 构建到自定义目录
cogita build --outDir dist

# 预览构建结果
cogita preview
```

## 可用命令

### `cogita create [name]`

创建新的 Cogita 博客项目。

**选项：**
- `-t, --template <name>` - 使用的模板（默认："basic"）
- `-p, --package-manager <pm>` - 包管理器（npm|yarn|pnpm）
- `--no-git` - 跳过 Git 初始化
- `--no-install` - 跳过依赖安装
- `-f, --force` - 覆盖现有目录

**模板：**
- `basic` - 功能完整的博客模板（默认）
- `minimal` - 基础功能的最小化设置
- `tech` - 开发者导向的技术博客模板
- `personal` - 个人博客模板，集成社交功能

### `cogita dev`

启动热重载开发服务器。

**选项：**
- `-p, --port <port>` - 端口号（默认：3000）
- `-h, --host <host>` - 主机地址（默认："localhost"）
- `--open` - 自动打开浏览器（默认：true）
- `--debug` - 启用调试模式

### `cogita build`

构建生产静态站点。

**选项：**
- `-o, --outDir <dir>` - 输出目录（默认："dist"）
- `--base <base>` - 部署的基础路径
- `--clean` - 构建前清理输出目录
- `--analyze` - 分析构建输出

### `cogita preview`

本地预览构建的站点。

**选项：**
- `-p, --port <port>` - 端口号（默认：4173）
- `--open` - 自动打开浏览器

## 示例工作流程

### 基础博客设置

```bash
# 创建并开始开发
cogita create my-blog
cd my-blog
cogita dev
```

### 部署到 GitHub Pages

```bash
# 使用正确的基础路径构建
cogita build --base /my-blog/

# 构建文件已准备好部署到 GitHub Pages
```

### 自定义开发

```bash
# 使用不同端口并启用调试
cogita dev --port 8080 --debug

# 构建并分析输出
cogita build --analyze
```

## 项目模板

### 基础模板
功能完整的博客包含：
- 预配置的 Lucid 主题
- 示例文章和页面
- 社交链接设置
- SEO 优化

### 最小模板
轻量级设置包含：
- 仅必要配置
- 单个示例文章
- 干净的起点

### 技术模板
开发者导向包含：
- 代码语法高亮
- 技术博客布局
- GitHub 集成
- 开发者友好默认值

### 个人模板
个人品牌专注：
- 社交媒体集成
- 关于页面模板
- 作品集部分
- 个人博客样式

## 配置

### CLI 配置

在项目中创建 `.cogitarc.json`：

```json
{
  "defaultTemplate": "tech",
  "packageManager": "pnpm",
  "devServer": {
    "port": 3000,
    "open": true
  }
}
```

### 环境变量

```bash
export COGITA_PACKAGE_MANAGER=pnpm
export COGITA_DEFAULT_TEMPLATE=minimal
export COGITA_DEBUG=true
```

## 故障排除

### 端口被占用

```bash
# 使用不同端口
cogita dev --port 3001

# 自动选择可用端口
cogita dev --port auto
```

### 构建问题

```bash
# 清理构建
cogita build --clean

# 调试构建
cogita build --debug
```

### 模板问题

```bash
# 强制重新创建
cogita create my-blog --force

# 跳过自动安装
cogita create my-blog --no-install
```

## 了解更多

- 📖 [完整文档](../../docs/README.md)
- 🧠 [核心包](../core) - CLI 背后的引擎
- 🎨 [UI 组件](../ui) - 可用组件
- 💡 [最佳实践](../../docs/best-practices.md)

## 相关包

- [🧠 @cogita/core](../core) - 核心博客引擎
- [🎨 @cogita/ui](../ui) - UI 组件库
- [🌟 @cogita/theme-lucid](../../themes/lucid) - 默认主题

## 许可证

MIT © [wu9o](https://github.com/wu9o)