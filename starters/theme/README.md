# Cogita theme starter

这是一个最小的第三方主题包模板。它演示了：

- 通过 `getThemeConfig` 导出 `CogitaTheme`。
- 提供必需的 `pageLayouts.home` 首页布局。
- 使用 `usePageData` 读取站点元数据。
- 将主题样式作为 `globalStyles` 和构建产物的一部分发布。

## 使用

复制本目录后，先把 `package.json` 和 `src/index.ts` 中的 `@your-scope/cogita-theme-starter` 替换为自己的包名，然后安装依赖并构建：

```bash
pnpm install
pnpm run build
```

在站点项目中使用：

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@your-scope/cogita-theme-starter',
});
```

主题只负责布局、样式和插件声明。文章、搜索、评论等业务能力应通过插件提供，并在主题中声明所需的能力。
