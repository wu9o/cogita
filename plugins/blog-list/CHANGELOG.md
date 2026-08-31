# @cogita/plugin-blog-list

## 0.3.3

### Patch Changes

- 03fc3c6: 补充插件发布包的默认入口条件，兼容 Core 通过配置加载器读取主题时的运行时解析路径。
- 03fc3c6: 固化构建上下文、ContentIndex、内置能力标识和虚拟模块 ID 的共享契约，并为 Core 与内置插件的虚拟模块统一增加版本头，方便主题和第三方消费者进行兼容性检查。
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
  - @cogita/shared@0.12.0

## 0.3.2

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

## 0.3.1

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 0.3.0

### Minor Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.1

## 0.2.1

### Patch Changes

- 91ba0ee: 增加构建期共享内容索引，减少文章列表和文章元数据插件的重复扫描，并为后续标签、分类、搜索和 RSS 等插件统一数据来源。
- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.2.0

### Minor Changes

- f49bfe4: 新增文章列表插件，支持静态分页、时间归档，并接入 Lucid 主题。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.0
