# API 参考

本文档集中说明 Cogita 的公共配置、主题、插件、内容索引和运行时模块接口。英文页面是默认入口；本页保留中文说明。

## 核心 API

### `@cogita/core`

#### `defineConfig(config: CogitaConfig): CogitaConfig`

定义类型安全的站点配置。它返回同一个配置对象，供 TypeScript 和 IDE 校验。

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的文档',
    description: '项目使用手册',
  },
  theme: '@cogita/theme-docs',
});
```

#### `loadCogitaConfig(root?: string): Promise<CogitaConfig>`

从项目根目录异步加载 `cogita.config.ts`、`cogita.config.js` 或 `cogita.config.mjs`。未传入 `root` 时使用 `process.cwd()`。

#### `createRspressConfig(cogitaConfig: CogitaConfig, root: string): Promise<UserConfig>`

将 Cogita 配置转换为 Rspress 配置，期间会解析主题、实例化主题声明的插件并合并配置。

## 配置接口

```ts
interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;
  contentDir?: string;
  contentSources?: readonly ContentSource[];
  plugins?: CogitaPluginFactory[];
  themeConfig?: ThemeConfig;
  builderConfig?: BuilderConfig;
  locales?: readonly SiteLocale[];
  languageParity?: LanguageParityConfig;
}
```

`contentDir` 用于普通 Markdown 文档。`contentSources` 用于接入 Git、API 或其他知识库；Core 会把这些条目统一纳入 `ContentIndex`。有正文读取器的外部条目还会生成静态页面。

### `SiteConfig`

```ts
interface SiteConfig {
  title?: string;
  description?: string;
  lang?: string;
  icon?: string;
  base?: string;
}
```

### `ContentSource`

内容源至少需要在站点内唯一的 `id` 和 `load` 函数。条目应提供 `kind`、`title`、`filePath`、`route` 和 `updateDate`；实现 `getContent` 后，全文搜索、内容关系和静态页面都可以消费该来源。

```ts
import type { ContentSource } from '@cogita/core';

const notes: ContentSource = {
  id: 'notes',
  async load() {
    return [{
      kind: 'document',
      title: '远程笔记',
      filePath: 'source://notes/remote-note',
      route: '/notes/remote-note',
      updateDate: '2026-08-25T00:00:00.000Z',
    }];
  },
  async getContent(entry) {
    return `# ${entry.title}\n\n来自外部知识库的正文。`;
  },
};
```

### 主题与构建配置

`ThemeConfig` 和 `BuilderConfig` 分别透传 Rspress 的 `themeConfig` 和 `builderConfig`。站点级多语言路由使用 `locales` 声明语言列表；`languageParity` 用于配置翻译缺失时的回退策略。

## 主题 API

```ts
interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
  };
  globalStyles?: string[];
  plugins?: CogitaPluginFactory[];
}
```

主题负责布局和视觉边界，并通过 `plugins` 声明需要的功能。配置验证和内容扫描属于插件或 Core，不应下沉到布局组件。

```ts
export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-lucid',
    pageLayouts: { home: './layouts/Home.js' },
    plugins: [pluginPostsFrontmatter, pluginTags],
  };
}
```

布局组件使用 `LayoutProps`，其中包含 `routePath`、Rspress `config`、页面数据和可选的 `children`。

## 插件 API

```ts
type CogitaPluginFactory = (
  config: CogitaPluginConfig,
) => RspressPlugin | RspressPlugin[] | null | undefined;
```

插件工厂接收 Core 增强后的配置。插件应验证自己的配置；未启用时返回 `null`，避免把无效插件注册到 Rspress。

```ts
export const pluginExample: CogitaPluginFactory = (config) => {
  if (!config.example?.enabled) return null;

  return {
    name: '@cogita/plugin-example',
    async beforeBuild() {},
  };
};
```

常用生命周期包括 `beforeBuild`、`afterBuild`、`addPages`、`addRuntimeModules` 和 `config`。新增页面使用 `routePath`、Markdown `content` 和组件 `filepath` 描述。站点自定义插件在 `cogita.config.ts` 的 `plugins` 数组中注册。

插件的构建上下文通过 `getCogitaBuildContext(config)` 获取，包含 `root`、`cwd`、`contentIndex`、主题布局路径和构建元数据。完整的注册、能力和版本规则见[插件 API 规范](../plugins/plugin-api-specification.html)。

## 内容索引与共享类型

```ts
interface ContentIndex {
  getPosts(): Promise<readonly ContentPost[]>;
  getEntries?(): Promise<readonly ContentEntry[]>;
  getPostContent?(filePath: string): Promise<string>;
  invalidate?(): void;
}
```

Core 创建惰性索引，多个插件共享同一个扫描结果。`getEntries` 覆盖文章、`contentDir` 文档和外部内容源；正文读取按需缓存。索引契约和外部内容源边界详见[内容索引设计](./content-index-design.html)。

文章引用统一使用 `@cogita/shared` 的 `ContentPostReference`。主题如果只需要渲染文章列表，应消费插件提供的运行时模块，不要重复扫描文件系统。

## 虚拟模块

### `virtual-posts-data`

由文章插件提供文章数据和 `contentDataVersion`：

```ts
declare module 'virtual-posts-data' {
  export const contentDataVersion: 1;
  export const allPosts: PostFrontmatter[];
}
```

### `virtual-content-relations-data`

由内容关系插件提供出链、反向链接和相关文章查询：

```ts
declare module 'virtual-content-relations-data' {
  export const cogitaVirtualModuleVersion: 1;
  export function getBacklinks(route: string): ContentRelationLink[];
  export function getOutgoingLinks(route: string): ContentRelationLink[];
  export function getRelatedContent(route: string, limit?: number): ContentRelationLink[];
}
```

插件应从 `COGITA_VIRTUAL_MODULE_IDS` 获取模块 ID，并用 `createCogitaVirtualModule(source)` 写入公共版本头。主题在版本不兼容时应明确降级或输出诊断。

## 生命周期与错误处理

配置加载、主题解析和插件实例化之后，Core 执行 `beforeBuild`、`addPages`、`addRuntimeModules`，再交给 Rspress 构建，最后执行 `afterBuild`。开发服务器会在相关输入变化时重新加载配置并重建插件数据。

CLI 会把配置缺失、加载失败和主题解析失败转换为稳定诊断码，例如 `COGITA_CONFIG_NOT_FOUND`。插件应在配置错误时给出明确提示，并在可选能力未配置时优雅降级。

## 相关资源

- [插件 API 规范](../plugins/plugin-api-specification.html)
- [插件开发指南](../plugins/plugin-development.html)
- [主题开发指南](../theme-development.html)
- [内容索引设计](./content-index-design.html)
