# @cogita/theme-docs

Cogita 的技术文档与框架使用手册主题。

该主题面向框架文档、API 参考和插件开发指南，不默认绑定博客文章列表、评论、RSS 或个人博客视觉组件。

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  theme: '@cogita/theme-docs',
});
```

主题包由站点项目直接安装和声明，Core 不需要为新增主题增加依赖。
