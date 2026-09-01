---
title: 插件开发
---

# 插件开发

Cogita 插件以工厂函数形式接收增强配置，并通过 Rspress 插件钩子参与构建。插件可以提供页面、虚拟模块、HTML 修改和构建检查能力，但不应把主题布局或站点内容写死在插件中。

## 开始开发

1. 阅读[插件开发指南](./plugin-development.md)。
2. 阅读[插件 API 规范](./plugin-api-specification.md)。
3. 参考[Posts Frontmatter 插件设计](./plugin-posts-frontmatter-design.md)理解完整的数据流。
4. 根据需要阅读具体插件的设计文档。

## 插件设计文档

- [Posts Frontmatter](./plugin-posts-frontmatter-design.md)
- [RSS](./plugin-rss-design.md)
- [Images](./plugin-images-design.md)
- [Sitemap](./plugin-sitemap-design.md)
- [SEO](./plugin-seo-design.md)
- [Blog List](./plugin-blog-list-design.md)
- [Search](./plugin-search-design.md)
- [Categories](./plugin-categories-design.md)
- [Reading Progress](./plugin-reading-progress-design.md)
- [Code Copy](./plugin-code-copy-design.md)
- [Comments](./plugin-comments-design.md)
- [内容检查](./plugin-content-check-design.md)
- [内容关系](./plugin-content-relations-design.md)
- [JSON 内容源](./plugin-content-source-json-design.md)

## 内置插件状态

当前内置插件覆盖文章索引、订阅、图片、站点地图、SEO、列表、搜索、分类、阅读进度、代码复制、评论、内容检查和内容关系。每个插件的实现状态以对应设计文档和包目录为准；文档不再把个人博客内容作为插件能力的一部分。

## 相关入口

- [API 与架构](../api/)
- [使用指南](../guides/)
- [返回文档中心](../)
- [项目主页](https://github.com/wu9o/cogita)
