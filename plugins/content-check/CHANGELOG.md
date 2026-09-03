# @cogita/plugin-content-check

## 0.2.5

### Patch Changes

- 657fc43: 增加 `ContentSource` 适配契约，允许外部内容源通过统一 `ContentIndex` 提供文章、文档和按需正文。
- 53e62d8: 为外部内容源增加静态资源发布契约，Git Markdown 内容源会自动发布并改写正文中的相对图片和资源引用。
- Updated dependencies [657fc43]
- Updated dependencies [53e62d8]
- Updated dependencies [b8cf7c8]
- Updated dependencies [d270384]
  - @cogita/shared@0.13.0

## 0.2.4

### Patch Changes

- 1a78273: 支持图片说明文字、统一文章与文档索引、知识库主题，以及跨内容来源的搜索、标签和关系数据能力。
- Updated dependencies [1a78273]
  - @cogita/shared@0.12.1

## 0.2.3

### Patch Changes

- 03fc3c6: 补充插件发布包的默认入口条件，兼容 Core 通过配置加载器读取主题时的运行时解析路径。
- 03fc3c6: 固化构建上下文、ContentIndex、内置能力标识和虚拟模块 ID 的共享契约，并为 Core 与内置插件的虚拟模块统一增加版本头，方便主题和第三方消费者进行兼容性检查。
- 03fc3c6: 统一内容检查和 SEO 审核报告 schema，新增 GitHub Actions annotation 与错误/警告阈值门禁。
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
- Updated dependencies [03fc3c6]
  - @cogita/shared@0.12.0

## 0.2.2

### Patch Changes

- 96dee48: 新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。

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
