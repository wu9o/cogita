# Knowledge 主题架构

`@cogita/theme-knowledge` 只负责知识库的信息架构和运行时展示，不扫描文件，也不解析
Markdown。内容数据由 Core 的统一 `ContentIndex` 提供，搜索、标签和关系由插件生成虚拟模块。

```text
posts/*.md + content/**/*.md
          ↓
      ContentIndex
       ↙    ↓    ↘
   search  tags  relations
       ↘    ↓    ↙
       Knowledge 主题布局
```

主题默认注册 `pluginPostsFrontmatter`、`pluginContentCheck`、`pluginSearch`、
`pluginTags` 和 `pluginContentRelations`。搜索、标签和关系插件通过主题包装器提供合理默认配置，
内容诊断插件则只有在站点显式配置 `contentCheck` 后才执行。

## 页面边界

- 首页展示统一内容条目、主题标签和关系数量；
- 搜索页消费搜索虚拟模块，不在浏览器重新读取源文件；
- 标签页消费标签虚拟模块，可展示标签索引和标签详情；
- 全局关系组件在有出链或反向链接的内容页展示探索入口；
- 内容诊断插件对文章和文档统一生成质量报告，不把检查逻辑放入布局；
- 文章和文档的正文仍由 Rspress 内容页面负责。
