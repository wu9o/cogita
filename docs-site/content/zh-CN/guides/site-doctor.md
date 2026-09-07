---
title: 站点升级与 doctor
description: 在升级和部署前使用 cogita doctor 检查站点的长期采用条件。
---

# 站点升级与 doctor

对于长期使用 Cogita 的真实站点，主要风险不是某次构建能否结束，而是配置、依赖、主题和内容目录在升级后是否仍然可维护。`cogita doctor` 提供只读的升级前检查。

## 基本用法

在站点根目录运行：

```bash
pnpm exec cogita doctor
```

如果站点 `package.json` 中包含 `"doctor": "cogita doctor"`，也可以运行 `pnpm run doctor`。CLI 模板默认会生成该脚本。

命令检查：

- Cogita 配置是否存在且可以加载；
- `package.json`、锁文件和 `cogita build` 脚本；
- `@cogita/cli`、`@cogita/core` 和配置主题是否已声明且可解析；
- 主题是否导出有效的 `getThemeConfig`；
- `contentDir` 或 `posts.dir` 指向的目录是否存在。

## 接入部署流水线

在生产构建前运行：

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm exec cogita doctor --strict --json
- run: pnpm run build
```

默认情况下只有错误会让 `doctor` 失败；`--strict` 会将警告也视为失败。部署流水线建议使用 `--strict --json`，保留稳定的 `schemaVersion`、检查码和详情，供 CI 生成摘要或 annotation。

## 结果解释

- `COGITA_DOCTOR_CONFIG_NOT_FOUND`：在站点根目录创建 `cogita.config.ts`，或使用 `cogita create` 初始化；
- `COGITA_DOCTOR_DEPENDENCY_UNRESOLVED`：重新安装依赖，确保锁文件与 `package.json` 一致；
- `COGITA_DOCTOR_THEME_CONTRACT_INVALID`：检查主题版本和 `getThemeConfig` 返回的布局契约；
- `COGITA_DOCTOR_CONTENT_DIR_NOT_FOUND`：创建内容目录或修正配置路径；
- `COGITA_DOCTOR_LOCKFILE_MISSING`：提交站点锁文件，保证部署依赖可复现。

该命令不会升级版本、修改依赖或执行完整生产构建。它只负责尽早识别站点是否具备构建条件；最终产物和页面行为仍需通过真实站点构建与浏览器验收确认。
