# @cogita/plugin-tags

## 1.0.7

### Patch Changes

- Updated dependencies [657fc43]
- Updated dependencies [53e62d8]
- Updated dependencies [b8cf7c8]
- Updated dependencies [d270384]
  - @cogita/shared@0.13.0

## 1.0.6

### Patch Changes

- 1a78273: 支持图片说明文字、统一文章与文档索引、知识库主题，以及跨内容来源的搜索、标签和关系数据能力。
- Updated dependencies [1a78273]
  - @cogita/shared@0.12.1

## 1.0.5

### Patch Changes

- 03fc3c6: 补充插件发布包的默认入口条件，兼容 Core 通过配置加载器读取主题时的运行时解析路径。
- 03fc3c6: 固化构建上下文、ContentIndex、内置能力标识和虚拟模块 ID 的共享契约，并为 Core 与内置插件的虚拟模块统一增加版本头，方便主题和第三方消费者进行兼容性检查。
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
  - @cogita/shared@0.12.0

## 1.0.4

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 1.0.3

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 1.0.2

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
  - @cogita/plugin-posts-frontmatter@0.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

## 1.0.0

### Patch Changes

- Updated dependencies [6c06862]
  - @cogita/plugin-posts-frontmatter@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [5d28fcd]
  - @cogita/plugin-posts-frontmatter@0.0.3

## 0.1.0

### Minor Changes

- bd78c85: 新增标签插件完整实现与主题 React 布局方案。

  ## 新功能

  - **@cogita/plugin-tags**：完整的标签管理插件

    - 自动从文章 frontmatter 提取标签，支持中英文
    - 生成标签索引页（/tags）和标签详情页（/tags/:slug）
    - 通过 `virtual-tags-data` 虚拟模块暴露标签数据（allTags、tagMap、getRelatedTags 等）
    - 标签页面使用主题 React 组件布局渲染（而非 Markdown 内容）

  - **@cogita/theme-lucid**：新增标签页布局与首页侧边栏
    - 新增 `TagPageLayout`（layouts/Tag.tsx），消费虚拟模块渲染标签索引页和详情页
    - 首页改为双栏布局：左侧标签云（TagCloud）+ 合集占位，右侧文章列表
    - 标签云点击跳转对应标签详情页

  ## 修复与改进

  - **@cogita/core**：

    - `createRspressConfig` 注入 `themeLayouts`，让 tags 等插件能用主题布局作为 `addPages` 的 filepath
    - `createThemePlugin` 传递 `globalStyles` 给 Rspress，修复 theme.css 从未加载的问题
    - 修正首页 frontmatter 为合法 YAML

  - **@cogita/shared**：

    - `CogitaPluginConfig` 增加 `themeLayouts` 字段
    - `CogitaTheme.pageLayouts` 增加 `tag` / `tagIndex` 可选字段

  - **@cogita/ui**：
    - `TagList` 改用本地 `generateTagSlug`（带兜底），避免 rspress 浏览器端无法 resolve `@cogita/shared`
    - `TagCloud` / `PostList` 样式优化

  ## Breaking Changes

  无。标签插件为新增功能，原有配置不受影响。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.0.2
