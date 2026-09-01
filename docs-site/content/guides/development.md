---
title: 开发指南
---

# 开发指南

## 初始化站点

可以使用 CLI 生成博客站或文档站的最小可运行项目：

```bash
pnpm dlx @cogita/cli create my-blog --template blog
pnpm dlx @cogita/cli create my-docs --template docs
```

博客模板从 `posts/` 读取文章，文档模板从 `content/` 读取 Markdown 页面。生成项目后执行 `pnpm run dev` 即可启动开发服务器。

本指南面向 Cogita 框架、插件和主题的贡献者，说明本地开发、质量检查、测试和发布前验证流程。

## 开发环境

要求：

- Node.js `>= 18`
- pnpm `>= 9`
- TypeScript `^5`

安装依赖：

```bash
pnpm install
```

Cogita 使用 pnpm workspace 管理包依赖，内部依赖使用 `workspace:*`。不要用 npm 或 yarn 替换安装命令，否则可能产生不兼容的 lockfile。

## 常用命令

```bash
# 构建所有可发布包
pnpm run build:packages

# 构建使用手册站点
pnpm run build:docs

# 启动使用手册开发服务器
pnpm run dev

# 预览生产构建
pnpm run preview

# 使用独立博客仓库的内容预览 Lucid 主题
pnpm run preview:lucid

# 构建并预览所有主题 Demo
pnpm run demo

# 运行代码检查和格式化检查
pnpm run check

# 运行工作区测试
pnpm run test

# 运行发布包边界和独立消费者检查
pnpm run check:release
```

修改包源码后，先运行 `pnpm run build:packages`，再运行文档站或测试。这样可以避免文档站继续引用旧的 `dist` 构建产物。

`preview:lucid` 默认读取同级目录中的 `cogita-blog` 仓库，也可以通过
`COGITA_BLOG_DIR=/path/to/cogita-blog pnpm run preview:lucid` 指定内容仓库。
该命令会复制文章和公共资源到临时预览目录，使用当前工作区源码构建包和 Lucid 主题，
并以根路径启动本地预览。生产环境的 `site.base` 仍应按实际部署地址配置。

## 主题 Demo 展示

仓库中的 `demos/` 不是已有博客的镜像，而是四个独立的 Cogita 消费者项目。每个目录都包含自己的 `package.json`、`cogita.config.ts` 和自定义 Markdown 内容，用来说明一个主题从配置到构建的完整接入方式：

| Demo | 主题 | 内容定位 |
| --- | --- | --- |
| `demos/docs` | `@cogita/theme-docs` | Northstar 工程手册 |
| `demos/lucid` | `@cogita/theme-lucid` | Field Notes 实践笔记 |
| `demos/editorial` | `@cogita/theme-editorial` | Small Systems Review 专题刊物 |
| `demos/knowledge` | `@cogita/theme-knowledge` | Atlas of Practice 知识库 |

执行 `pnpm run demo` 会先运行包构建，再构建四个 Demo，并在 `http://localhost:3100/` 提供总览页。也可以只构建 Demo：

```bash
pnpm run build:demos
```

如果要单独开发某个主题，可以在仓库根目录执行 `pnpm --filter @cogita/demo-knowledge dev`，将其中的包名替换为目标 Demo。新增内置主题时，应同时增加对应 Demo 和总览入口；这样贡献者可以从独立消费者验证主题配置，而不必依赖真实博客内容。

## 工作区结构

```text
packages/       # Core、CLI、Shared 和 UI
plugins/        # 可选功能插件
themes/         # 完整主题包
docs-site/      # 框架使用手册示例
scripts/        # 构建和辅助脚本
```

个人博客、产品文档和其他真实内容站点不放在本仓库中，而是通过 npm 包消费 Cogita。这样框架代码、使用手册和站点内容拥有独立的发布边界。

## 新增插件

建议的插件结构：

```text
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
```

插件必须遵循工厂模式：

```ts
import type { CogitaPluginConfig } from '@cogita/shared';

export function pluginYourFeature(config: CogitaPluginConfig) {
  if (!config.yourFeature) {
    return null;
  }

  return {
    name: '@cogita/plugin-your-feature',
    async beforeBuild() {
      // 在构建阶段处理文件或生成数据
    },
  };
}
```

插件需要做到：

1. 在自己的配置命名空间中读取配置；
2. 未启用或缺少依赖时优雅返回 `null`；
3. 使用 `getCogitaBuildContext` 获取共享索引、主题布局和日志；
4. 通过 `cogita.requiredLayouts` 声明需要的主题页面；
5. 通过 `cogita.providesCapabilities` 和 `cogita.requiresCapabilities` 声明能力依赖；
6. 通过虚拟模块把构建期数据传给运行时；
7. 为默认配置、关闭配置、能力缺失和错误配置编写测试。

## 新增主题

主题是页面布局、样式和默认插件能力的组合包。建议的结构：

```text
themes/your-theme/
├── src/
│   ├── index.ts
│   ├── layouts/
│   ├── components/
│   └── theme.css
├── package.json
├── tsconfig.json
└── rslib.config.ts
```

主题入口只声明布局和插件：

```ts
import type { CogitaTheme } from '@cogita/shared';
import path from 'node:path';

export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-your-theme',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: [path.resolve(__dirname, './theme.css')],
    plugins: [],
  };
}
```

主题不要处理插件配置验证，也不要把具体站点内容写死在布局里。新增页面能力时，让插件声明布局需求，让主题实现对应的 `pageLayouts` 键。

## 代码质量

项目使用 Biome，而不是 ESLint 和 Prettier：

```bash
pnpm run check
pnpm run check:fix
```

代码注释、JSDoc、TODO 和 FIXME 使用中文。TypeScript 使用严格模式，除非有明确边界，不要使用 `any`。

提交信息使用 Conventional Commits：

```text
feat(plugin): add image metadata support
fix(core): validate theme layout contract
docs: update deployment guide
refactor(shared): simplify build context
```

提交前的 Husky 钩子会检查暂存文件并重新构建包。钩子中的旧版 Husky 警告不影响当前构建，但升级 Husky 主版本前需要单独迁移钩子格式。

## 测试

插件测试使用 Node.js 原生测试运行器：

```bash
pnpm --filter @cogita/plugin-your-feature test
```

Core 和插件至少覆盖以下场景：

- 默认配置是否稳定；
- 显式关闭时是否安全降级；
- 配置错误是否提供可读错误；
- 虚拟模块内容是否符合运行时契约；
- 页面布局缺失时是否按预期阻断或跳过构建。

完整验证：

```bash
pnpm run build:packages
pnpm --filter docs-site build
pnpm run check
pnpm run test
```

发布前还应运行 `pnpm run check:release`。它会在一次包构建后依次检查发布包边界、最小博客消费者、独立博客消费者和独立文档消费者。开发机上没有同级 `cogita-blog` 仓库时，外部博客检查会跳过；CI 发布流程会显式检出 `wu9o/cogita-blog`，缺少博客消费者或构建失败都会阻断发布。

## 文档同步

代码变更需要同步更新：

- 包目录下的 `README.md`；
- `docs-site/content` 中对应的使用或设计文档；
- 需要发布版本变化时的 Changeset。

文档中的示例应使用当前公开包名，例如 `@cogita/theme-lucid`，不要使用已经废弃的 `'lucid'` 简写或已经拆出的 `blog` workspace 命令。

## 发布包

不要手动修改包版本号。使用 Changesets 记录变更：

```bash
pnpm changeset
pnpm changeset status
pnpm version-packages
pnpm release
```

Changeset 应说明受影响的包、变更级别和用户可感知的变化。只修改文档站内容时通常不需要给包版本升级；修改主题、插件或 Core 行为时需要记录对应包。

## 提交前清单

- [ ] 当前分支基于最新 `main`；
- [ ] 已运行 `pnpm run build:packages`；
- [ ] 已运行 `pnpm run check` 和相关测试；
- [ ] 文档站可以成功构建；
- [ ] README、设计文档和 Changeset 已同步；
- [ ] 没有把个人博客文章或站点密钥提交到框架仓库；
- [ ] 提交信息符合 Conventional Commits。
