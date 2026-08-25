# @cogita/plugin-comments

## 0.2.3

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 0.2.2

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.2.1

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.2.0

### Minor Changes

- f02ba04: 新增可选评论插件，支持在文章页接入 Giscus 或 Utterances。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.0
