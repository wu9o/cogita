# @cogita/plugin-content-check

## 0.2.1

### Patch Changes

- 5a8bd5e: 新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，未配置主题时不再隐式加载 Lucid，并补齐独立配置加载所需的包导出条件；新增 `contentDir`，让文档站点可以将普通 Markdown 内容接入构建和开发流程。
- Updated dependencies [5a8bd5e]
  - @cogita/plugin-posts-frontmatter@0.1.2

## 0.2.0

### Minor Changes

- 77e58eb: 新增内容质量与构建诊断插件，支持 frontmatter 必填字段、解析错误、重复路由、本地链接、正文图片引用、图片替代文本和空正文检查，并支持规则级别覆盖、问题忽略和版本化 JSON 报告。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.1.1
