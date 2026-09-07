---
title: 开发指南
---

# 开发指南

本文面向 Cogita 框架、主题和插件贡献者，介绍本地开发、质量检查、测试和发布验证。

## 初始化站点

使用 CLI 创建博客、文档或知识库站点：

```bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
pnpm dlx @cogita/cli create my-knowledge --template knowledge
```

博客模板读取 `posts/`，文档模板读取 `content/`，Knowledge 模板同时读取两种内容。生成后运行 `pnpm run dev`。

## 开发环境与常用命令

要求：Node.js `>= 18`、pnpm `>= 9`、TypeScript `^5`。安装依赖：

```bash
pnpm install
```

常用命令：

```bash
pnpm run build:packages
pnpm run build:docs
pnpm run dev
pnpm run preview
pnpm run check
pnpm run test
pnpm run check:release
```

修改包源代码后，先运行 `pnpm run build:packages`，避免文档站或测试消费过期的 `dist` 输出。`preview:lucid` 默认读取同级的 `cogita-blog` 仓库，也可以通过 `COGITA_BLOG_DIR` 指定其他内容仓库。

## 主题 Demo

`demos/` 包含四个独立 Cogita 消费者，而不是现有博客的镜像：Docs、Lucid、Editorial 和 Knowledge。运行 `pnpm run demo` 构建四个 Demo 并在 `http://localhost:3100/` 提供入口。每个新增官方主题都应添加独立 Demo 和索引项，方便贡献者验证消费者配置。

## 添加插件

推荐结构：

~~~text
plugins/your-feature/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   └── utils.ts
├── tests/
├── client.d.ts
├── package.json
├── tsconfig.json
└── rslib.config.ts
~~~

插件应使用工厂模式，读取自己的配置命名空间；禁用或缺少能力时返回 `null`；通过 `getCogitaBuildContext` 使用共享索引、布局和日志；通过能力声明与虚拟模块提供稳定契约；并覆盖默认值、禁用配置、缺少能力和非法配置测试。

## 添加主题

主题组合页面布局、样式和默认插件能力。入口应声明 `pageLayouts`、全局样式和 `plugins`，不要在主题中校验插件选项或把站点内容写死在布局里。

## 代码质量与测试

项目使用 Biome，而不是 ESLint 或 Prettier：

```bash
pnpm run check
pnpm run check:fix
```

代码注释、JSDoc、TODO 和 FIXME 使用中文；保持 TypeScript 严格模式；遵循 Conventional Commits。完整验证包括包构建、docs-site 构建、检查和测试；发布前再运行 `pnpm run check:release`。

## 文档和发布

代码变化时同步更新包 README 与 `docs-site/content` 对应页面；发布包变化时添加 Changeset；不要手动修改版本号。提交前确认分支基于最新 `main`、包构建和检查通过、文档站构建成功，且没有私有内容或凭据进入框架仓库。
