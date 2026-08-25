---
'@cogita/shared': minor
'@cogita/core': patch
'@cogita/plugin-blog-list': patch
'@cogita/plugin-categories': patch
'@cogita/plugin-code-copy': patch
'@cogita/plugin-collections': patch
'@cogita/plugin-comments': patch
'@cogita/plugin-content-check': patch
'@cogita/plugin-images': patch
'@cogita/plugin-reading-progress': patch
'@cogita/plugin-rss': patch
'@cogita/plugin-search': patch
'@cogita/plugin-seo': patch
'@cogita/plugin-sitemap': patch
'@cogita/plugin-tags': patch
'@cogita/plugin-posts-frontmatter': patch
'@cogita/theme-editorial': patch
'@cogita/theme-lucid': patch
---

新增主题与插件之间的能力契约，并统一聚合插件使用的文章引用数据模型。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断；文章虚拟模块同时暴露内容数据契约版本，便于外部主题检查兼容性。依赖文章能力的插件改为消费 Core 共享内容索引，不再直接耦合文章扫描插件。
