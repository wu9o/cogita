---
'@cogita/shared': minor
'@cogita/core': patch
'@cogita/plugin-posts-frontmatter': patch
'@cogita/theme-editorial': patch
'@cogita/theme-lucid': patch
---

新增主题与插件之间的能力契约。插件可以声明提供和依赖的能力，主题可以声明必需与可选能力，Core 会在构建前统一校验并在非严格模式下提供降级诊断。
