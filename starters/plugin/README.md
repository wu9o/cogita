# Cogita plugin starter

这是一个最小的第三方插件包模板。它演示了：

- 用 `createStarterPlugin` 创建带选项的 `CogitaPluginFactory`。
- 用 `buildContext` 获取构建期上下文。
- 用 `getCogitaLogger` 接入统一构建日志。
- 在插件元数据中声明自己提供的能力。

## 使用

复制本目录后，先把 `package.json` 和 `src/plugin.ts` 中的 `@your-scope/cogita-plugin-starter` 替换为自己的包名，然后安装依赖并构建：

```bash
pnpm install
pnpm run build
```

在站点项目中注册：

```ts
import { defineConfig } from '@cogita/core';
import { createStarterPlugin } from '@your-scope/cogita-plugin-starter';

export default defineConfig({
  plugins: [
    createStarterPlugin({
      message: '站点级内容增强已准备',
    }),
  ],
});
```

需要配置时，优先通过工厂闭包传入选项；需要与 Cogita 配置联动时，再把读取逻辑集中放在工厂函数中，并在缺少必要配置时返回 `null`。
