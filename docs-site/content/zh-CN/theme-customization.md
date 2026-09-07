---
title: 主题使用与扩展
---

# 主题使用与扩展

主题是独立的 npm 包。除了视觉样式，主题还可以声明所需的插件和页面布局。站点在配置中选择主题，并直接安装主题包。

## 安装主题

~~~bash
pnpm add -D @cogita/theme-docs
~~~

然后在 `cogita.config.ts` 中选择：

~~~ts
export default defineConfig({
  theme: '@cogita/theme-docs',
});
~~~

## 主题配置

主题通过 `themeConfig` 接收站点级选项。导航、侧边栏和主题专属选项应放在这里，不要把主题实现细节放进 Core 配置。

## 官方主题

| 主题包 | 适用场景 | 视觉定位 |
| --- | --- | --- |
| `@cogita/theme-docs` | Cogita 手册 | 文档导航、侧边栏和 API 阅读 |
| `@cogita/theme-lucid` | 独立博客和内容站点 | 轻量 Hero、文章卡片和内容侧栏 |
| `@cogita/theme-editorial` | 内容优先的技术发布 | 编辑感排版、精选文章和专注阅读 |
| `@cogita/theme-knowledge` | 个人 Wiki、研究笔记和混合知识库 | 统一内容、搜索、主题和反向链接 |

主题是站点的渲染边界：Core 处理配置、路由和构建，插件提供数据，主题决定如何组织这些数据。新增主题时，应先增加主题包和专属配置，再考虑修改 Core。

## Knowledge 配置

Knowledge 把 `posts` 和 `contentDir` 放到同一个内容入口，并默认组合搜索、主题和内容关系，适合长期积累、交叉引用和持续回访的知识库：

~~~ts
export default defineConfig({
  contentDir: 'content',
  theme: '@cogita/theme-knowledge',
});
~~~

当站点同时维护文章和普通文档时，Knowledge 会在首页、搜索和内容关系中同时展示两种内容。内容质量诊断仍通过 `contentCheck` 选择性启用，完整信息架构见 [Knowledge 主题指南](./themes/theme-knowledge-design.md)。

## 替换和扩展

如果需要改变页面结构，应创建自己的主题包，复用共享类型和 UI 组件，并在主题中声明所需插件。站点只需要切换 `theme` 包，内容和框架包不需要迁移。

详见[主题开发指南](./theme-development.md)和[架构设计](./api/architecture-design.md)。
