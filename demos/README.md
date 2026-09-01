# Cogita 主题 Demo

这里的每个目录都是一个独立的 Cogita 站点消费者，用自定义内容展示对应主题的接入方式。它们不依赖 `blog/`，也不复用外部内容站点，适合在 GitHub 上直接阅读配置并在本地查看效果。

## 运行总览

在仓库根目录执行：

```bash
pnpm install
pnpm run demo
```

然后打开 <http://localhost:3100/>。落地页会链接到四个独立 Demo：

| Demo | 主题 | 示例内容 |
| --- | --- | --- |
| `/demos/docs/` | `@cogita/theme-docs` | Northstar 工程手册 |
| `/demos/lucid/` | `@cogita/theme-lucid` | Field Notes 实践笔记 |
| `/demos/editorial/` | `@cogita/theme-editorial` | The Small Systems Review |
| `/demos/knowledge/` | `@cogita/theme-knowledge` | Atlas of Practice 知识库与 JSON 内容源 |

`pnpm run demo` 会先构建 Core、插件、主题和四个 Demo，再启动一个静态预览服务。只想构建而不启动服务时执行 `pnpm run build:demos`。

## 单独开发

每个 Demo 都支持独立开发服务器：

```bash
pnpm --filter @cogita/demo-docs dev
pnpm --filter @cogita/demo-lucid dev
pnpm --filter @cogita/demo-editorial dev
pnpm --filter @cogita/demo-knowledge dev
```

新增内置主题时，需要同步增加 `demos/<theme>/package.json`、`cogita.config.ts` 和自定义内容，并在 `scripts/serve-demos.mjs` 的总览提示与落地页中加入入口。结构测试会确保每个主题都有可读、可构建的 Demo。
