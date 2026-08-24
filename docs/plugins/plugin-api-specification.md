# 插件 API 规范

本文档定义 Cogita 插件的公共注册、配置和构建期协作契约。目标是让主题插件、站点自定义插件和未来的社区插件使用同一套边界。

## 1. 插件工厂

插件必须导出接收 `CogitaPluginConfig` 的工厂函数：

```typescript
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginExample: CogitaPluginFactory = (config) => {
  if (config.example?.enabled === false) {
    return null;
  }

  return {
    name: '@cogita/plugin-example',
    beforeBuild() {
      // 在这里执行构建期准备工作
    },
  };
};
```

工厂允许返回单个 Rspress 插件、插件数组或 `null` / `undefined`。未启用的插件应返回 `null`，不要在工厂外部让主题或 core 处理插件自身的配置判断。

## 2. 注册入口与顺序

主题继续通过 `CogitaTheme.plugins` 声明默认能力；站点可以通过 `CogitaConfig.plugins` 注册额外插件：

```typescript
import { defineConfig } from '@cogita/core';
import { pluginExample } from './plugins/example';

export default defineConfig({
  theme: 'lucid',
  plugins: [pluginExample],
});
```

最终注册顺序固定为：核心插件 → 主题桥接插件 → 主题插件 → 用户插件。Rspress 按这个顺序执行插件生命周期。

核心注册器会在运行时再次校验工厂返回值：插件必须提供非空的 `name` 字段。严格模式下无效返回值或工厂异常会阻断构建，并保留原始异常作为 `cause`；非严格模式下会记录警告并跳过当前插件，避免破坏其他已注册插件。

主题的 `home` 布局是必需契约；启用某个功能插件时，其对应布局也必须声明且指向实际存在的文件。core 会在插件实例化前校验这些路径，避免构建完成后才暴露首页或功能页 404。

## 3. 名称唯一性

每个插件实例的 `name` 是注册身份，必须在最终插件列表中唯一。默认 `strict` 为 `true`，重复名称会抛错并阻断构建，避免同一虚拟模块、页面或生命周期被静默执行两次。

确有兼容需要时，可以配置 `strict: false`。此时保留首次注册的插件，并通过统一日志出口输出警告。

## 4. 构建上下文

插件应优先通过共享辅助函数读取构建期能力：

```typescript
import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';

const pluginExample: CogitaPluginFactory = (config) => {
  const context = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);

  return {
    name: '@cogita/plugin-example',
    async beforeBuild() {
      logger.info(`构建根目录：${context.root}`);
      const posts = await context.contentIndex?.getPosts();
      logger.debug(`文章数量：${posts?.length ?? 0}`);
    },
  };
};
```

`CogitaBuildContext` 字段：

| 字段 | 作用 |
| --- | --- |
| `root` / `cwd` | 站点根目录和当前工作目录 |
| `contentIndex` | core 创建并共享的文章索引 |
| `themeLayouts` | 主题布局的绝对路径映射 |
| `strict` | 当前构建是否严格处理错误 |
| `logger` | `debug`、`info`、`warn`、`error` 日志出口 |
| `framework` | Cogita 构建版本和时间元数据 |

旧版顶层字段仍会兼容，但新增构建期能力应优先加入 `CogitaBuildContext`。

## 5. 生命周期边界

- `beforeBuild`：读取内容索引、准备文件和校验配置。
- `addPages`：生成额外页面，不应在这里重复扫描文章。
- `addRuntimeModules`：暴露序列化后的构建数据给浏览器运行时。
- `afterBuild`：写入报告或构建产物，不应修改已经生成的页面内容。

插件之间通过 `contentIndex` 和虚拟模块共享数据；主题布局只负责展示，不应承担插件配置验证和文件扫描职责。

## 6. 测试要求

至少覆盖以下场景：

- 配置缺失或 `enabled: false` 时返回 `null`。
- 构建上下文能读取站点根目录和共享内容索引。
- 插件名称重复时，严格模式阻断、非严格模式保留首次注册。
- `beforeBuild`、页面生成和虚拟模块输出在最小站点中可执行。
