---
title: 站点升级与自检
description: 使用 cogita doctor 在升级和部署前检查真实站点的长期采用条件。
---

# 站点升级与自检

真实站点长期使用 Cogita 时，最常见的问题不是框架能否完成一次构建，而是升级后配置、依赖、主题和内容目录是否仍然处于可支持状态。`cogita doctor` 提供一个只读的升级前检查入口。

## 基本用法

在站点根目录执行：

```bash
pnpm run doctor
```

它会检查：

- Cogita 配置文件是否存在且可以加载；
- `package.json`、lockfile 和 `cogita build` 脚本；
- `@cogita/cli`、`@cogita/core` 和配置主题是否已声明并可解析；
- 主题是否导出有效的 `getThemeConfig`；
- `contentDir` 或 `posts.dir` 指向的目录是否存在。

## 接入部署流水线

建议将自检放在生产构建之前：

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm exec cogita doctor --strict --json
- run: pnpm run build
```

`doctor` 默认只会因为 error 退出失败；`--strict` 会将 warning 也视为失败。对于部署流水线，推荐使用 `--strict --json`，这样可以保留稳定的 `schemaVersion`、检查码和详情，后续可以由 CI 生成自己的摘要或注释。

## 如何处理结果

- `COGITA_DOCTOR_CONFIG_NOT_FOUND`：在站点根目录创建 `cogita.config.ts`，或使用 `cogita create` 初始化。
- `COGITA_DOCTOR_DEPENDENCY_UNRESOLVED`：重新安装依赖，并确认 lockfile 与 `package.json` 一致。
- `COGITA_DOCTOR_THEME_CONTRACT_INVALID`：检查主题版本和 `getThemeConfig` 返回的布局契约。
- `COGITA_DOCTOR_CONTENT_DIR_NOT_FOUND`：创建内容目录，或修正配置中的路径。
- `COGITA_DOCTOR_LOCKFILE_MISSING`：将站点使用的 lockfile 提交到版本库，保证部署依赖可复现。

该命令不会自动升级版本、修改依赖或执行完整生产构建。它的职责是尽早指出“站点当前是否适合继续构建”，构建产物和页面行为仍应由后续的真实站点构建与浏览器验收负责。
