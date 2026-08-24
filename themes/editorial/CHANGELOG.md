# @cogita/theme-editorial

## 0.2.5

### Patch Changes

- 77e58eb: 新增内容质量与构建诊断插件，支持 frontmatter 必填字段、解析错误、重复路由、本地链接、正文图片引用、图片替代文本和空正文检查，并支持规则级别覆盖、问题忽略和版本化 JSON 报告。
- Updated dependencies [77e58eb]
  - @cogita/plugin-content-check@0.2.0
  - @cogita/shared@0.9.1
  - @cogita/plugin-blog-list@0.3.0
  - @cogita/plugin-categories@0.2.2
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-collections@1.0.2
  - @cogita/plugin-comments@0.2.2
  - @cogita/plugin-images@1.0.2
  - @cogita/plugin-posts-frontmatter@0.1.1
  - @cogita/plugin-reading-progress@0.3.2
  - @cogita/plugin-rss@1.0.2
  - @cogita/plugin-search@0.2.2
  - @cogita/plugin-seo@1.3.2
  - @cogita/plugin-sitemap@1.3.2
  - @cogita/plugin-tags@1.0.2

## 0.2.4

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
- Updated dependencies [cd14acc]
  - @cogita/shared@0.9.0
  - @cogita/plugin-blog-list@0.3.0
  - @cogita/plugin-tags@1.0.2
  - @cogita/plugin-categories@0.2.2
  - @cogita/plugin-collections@1.0.2
  - @cogita/plugin-search@0.2.2
  - @cogita/plugin-rss@1.0.2
  - @cogita/plugin-seo@1.3.2
  - @cogita/plugin-sitemap@1.3.2
  - @cogita/plugin-images@1.0.2
  - @cogita/plugin-reading-progress@0.3.2
  - @cogita/plugin-comments@0.2.2
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-posts-frontmatter@0.1.1

## 0.2.3

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/shared@0.8.0
  - @cogita/plugin-blog-list@0.2.1
  - @cogita/plugin-posts-frontmatter@0.1.1
  - @cogita/plugin-categories@0.2.1
  - @cogita/plugin-code-copy@0.2.1
  - @cogita/plugin-collections@1.0.1
  - @cogita/plugin-comments@0.2.1
  - @cogita/plugin-images@1.0.1
  - @cogita/plugin-reading-progress@0.3.1
  - @cogita/plugin-rss@1.0.1
  - @cogita/plugin-search@0.2.1
  - @cogita/plugin-seo@1.3.1
  - @cogita/plugin-sitemap@1.3.1
  - @cogita/plugin-tags@1.0.1

## 0.2.2

### Patch Changes

- d6d46df: 代码复制插件支持选中代码内容优先复制，并同步增强 Editorial 与 Lucid 主题的复制按钮提示。
- Updated dependencies [d6d46df]
  - @cogita/plugin-code-copy@0.2.1

## 0.2.1

### Patch Changes

- e09a825: Editorial 主题完善移动端导航抽屉、列表页宽度和页脚视觉样式，并修复移动端菜单为空的问题。
- e09a825: 支持站点自定义 favicon，完善 Editorial 主题的站点描述和手动暗黑模式样式。
- e09a825: 阅读进度插件新增目录联动和可选的文章阅读位置记忆，两个主题同步提供恢复提示和返回顶部操作。
- e09a825: 统一两个主题的合集、标签、分类和文章导航链接处理，提升子路径部署与静态路由下的链接稳定性。
- e09a825: 抽取主题共用的站点路径解析和日期格式化工具，统一 Editorial 与 Lucid 的页面路由处理。
- Updated dependencies [e09a825]
- Updated dependencies [e09a825]
  - @cogita/plugin-reading-progress@0.3.0
  - @cogita/shared@0.7.1
  - @cogita/plugin-blog-list@0.2.0
  - @cogita/plugin-categories@0.2.0
  - @cogita/plugin-code-copy@0.2.0
  - @cogita/plugin-collections@1.0.0
  - @cogita/plugin-comments@0.2.0
  - @cogita/plugin-images@1.0.0
  - @cogita/plugin-posts-frontmatter@0.1.0
  - @cogita/plugin-rss@1.0.0
  - @cogita/plugin-search@0.2.0
  - @cogita/plugin-seo@1.3.0
  - @cogita/plugin-sitemap@1.3.0
  - @cogita/plugin-tags@1.0.0

## 0.2.0

### Minor Changes

- e549dee: 新增 Editorial 内容优先博客主题，提供带页面背景层次的首页、文章索引、搜索、归档、标签、分类和合集布局，并统一内置主题别名解析。
