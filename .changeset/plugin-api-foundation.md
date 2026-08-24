---
'@cogita/shared': minor
'@cogita/core': minor
'@cogita/plugin-blog-list': patch
'@cogita/plugin-categories': patch
'@cogita/plugin-code-copy': patch
'@cogita/plugin-collections': patch
'@cogita/plugin-comments': patch
'@cogita/plugin-content-check': patch
'@cogita/plugin-images': patch
'@cogita/plugin-posts-frontmatter': patch
'@cogita/plugin-reading-progress': patch
'@cogita/plugin-rss': patch
'@cogita/plugin-search': patch
'@cogita/plugin-seo': patch
'@cogita/plugin-sitemap': patch
'@cogita/plugin-tags': patch
---

新增用户插件注册入口、规范化构建上下文、统一日志接口和插件名称重复检测；主题改为优先从消费方项目解析，页面插件通过 `cogita.requiredLayouts` 声明主题布局契约；Core 不再强依赖具体博客主题，旧主题别名改为可选兼容能力，并补齐独立配置加载所需的包导出条件。
