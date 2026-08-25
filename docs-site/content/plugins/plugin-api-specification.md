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
  theme: '@cogita/theme-lucid',
  plugins: [pluginExample],
});
```

最终注册顺序固定为：核心插件 → 主题桥接插件 → 主题插件 → 用户插件。这个顺序用于确定插件身份、来源和冲突处理；不要把它当作生命周期的串行执行顺序。Rspress 可能并行调用多个插件的构建钩子，插件之间需要通过共享 `contentIndex` 或虚拟模块建立数据契约，而不是依赖数组前后顺序。

核心注册器会在运行时再次校验工厂返回值：插件必须提供非空的 `name` 字段。严格模式下无效返回值或工厂异常会阻断构建，并保留原始异常作为 `cause`；非严格模式下会记录警告并跳过当前插件，避免破坏其他已注册插件。

主题的 `home` 布局是必需契约；需要生成主题页面的插件可以在返回的插件实例中声明布局需求。core 会在所有插件实例化后统一校验这些声明，避免构建完成后才暴露首页或功能页 404。布局需求不再由 core 维护插件名称清单，因此第三方插件可以自行扩展页面能力。

```typescript
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginExample: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-example',
  cogita: {
    requiredLayouts: [
      { layout: 'example', label: '示例页面' },
      {
        layout: 'example-detail',
        label: '示例详情页',
        when: (config) => config.example?.detailEnabled === true,
      },
    ],
  },
});
```

`requiredLayouts` 中的 `layout` 对应主题 `pageLayouts` 的键名；`when` 可根据最终插件配置决定是否启用某项布局检查。

## 3. 能力契约

布局契约只描述“页面是否存在”，能力契约进一步描述主题或插件“需要什么数据能力”。能力标识使用稳定的 `领域.能力` 字符串，例如 `content.posts`。插件通过 `providesCapabilities` 声明自己提供的能力，通过 `requiresCapabilities` 声明依赖；主题通过 `capabilities.required` 和 `capabilities.optional` 区分硬依赖与可降级增强。

```typescript
export const pluginPosts: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-posts-frontmatter',
  cogita: {
    providesCapabilities: ['content.posts'],
  },
});

export const themeExample: CogitaTheme = {
  name: '@cogita/theme-example',
  capabilities: {
    required: ['content.posts'],
    optional: ['content.images'],
  },
  pageLayouts: { home: './layouts/Home.js' },
};
```

Core 会在所有插件实例化后统一校验主题硬依赖和插件依赖。默认严格模式下，缺少能力会在构建阶段直接失败；`strict: false` 时只记录警告，由主题负责对 `optional` 能力进行降级。Core 提供的运行时空模块只保证可选模块安全导入，不会冒充真实业务能力。

当前内置插件使用的能力标识如下：

| 能力标识 | 提供者 | 典型消费者 |
| --- | --- | --- |
| `content.posts` | Posts Frontmatter | 标签、合集、分类、搜索、文章列表 |
| `content.images` | Images | 主题封面与图片清单 |
| `content.collections` | Collections | 合集导航 |
| `discovery.tags` | Tags | 标签导航 |
| `discovery.categories` | Categories | 分类导航 |
| `discovery.search` | Search | 搜索页面 |
| `content.blog-list` | Blog List | 归档与文章列表 |
| `engagement.comments` | Comments | 文章评论区域 |
| `ui.code-copy` | Code Copy | 代码块复制按钮 |
| `ui.reading-progress` | Reading Progress | 阅读进度和阅读时间 |
| `syndication.rss` | RSS | RSS、Atom、JSON Feed |
| `seo.metadata` / `seo.sitemap` | SEO / Sitemap | 搜索引擎元数据与站点地图 |

## 4. 运行时模块契约

插件通过 `addRuntimeModules` 向主题布局提供构建期数据。每个模块标识在一次构建中必须唯一；如果两个插件注册同一个模块，严格模式会阻断构建，避免运行时拿到不确定的数据。

Core 会为可选能力提供安全的空模块。Core 的默认模块通过显式元数据标记为 `fallback`，真实插件可以覆盖它；这个行为不依赖默认插件的 `name`，因此第三方插件不应通过复用或猜测插件名称来改变注册策略。

```typescript
import type { CogitaPlugin } from '@cogita/shared';

const fallbackPlugin: CogitaPlugin = {
  name: '@cogita/plugin-example-defaults',
  cogita: { runtimeModulePolicy: 'fallback' },
  addRuntimeModules() {
    return { 'virtual-example-data': 'export const items = [];' };
  },
};
```

默认模块只应该提供主题可安全消费的空数据和关闭状态，不应该泄露构建机绝对路径、令牌或文章正文。真实插件启用后应注册相同的模块标识，并提供完整数据契约。

## 5. 名称唯一性

每个插件实例的 `name` 是注册身份，必须在最终插件列表中唯一。默认 `strict` 为 `true`，重复名称会抛错并阻断构建，避免同一虚拟模块、页面或生命周期被静默执行两次。

确有兼容需要时，可以配置 `strict: false`。此时保留首次注册的插件，并通过统一日志出口输出警告。

## 6. 构建上下文

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

## 7. 生命周期边界

- `beforeBuild`：读取内容索引、准备文件和校验配置。
- `addPages`：生成额外页面，不应在这里重复扫描文章。
- `addRuntimeModules`：暴露序列化后的构建数据给浏览器运行时。
- `afterBuild`：写入报告或构建产物，不应修改已经生成的页面内容。

插件之间通过 `contentIndex` 和虚拟模块共享数据；主题布局只负责展示，不应承担插件配置验证和文件扫描职责。

## 8. 测试要求

至少覆盖以下场景：

- 配置缺失或 `enabled: false` 时返回 `null`。
- 构建上下文能读取站点根目录和共享内容索引。
- 插件名称重复时，严格模式阻断、非严格模式保留首次注册。
- `beforeBuild`、页面生成和虚拟模块输出在最小站点中可执行。
