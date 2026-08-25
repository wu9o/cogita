# @cogita/plugin-blog-list

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
