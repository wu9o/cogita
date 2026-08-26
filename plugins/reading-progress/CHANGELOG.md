# @cogita/plugin-reading-progress

## 0.3.4

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 0.3.3

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 0.3.2

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.3.1

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.3.0

### Minor Changes

- e09a825: 阅读进度插件新增目录联动和可选的文章阅读位置记忆，两个主题同步提供恢复提示和返回顶部操作。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.0

## 0.2.0

### Minor Changes

- d58cf44: 新增阅读进度与预计阅读时间插件，并接入 Lucid 主题。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.0
