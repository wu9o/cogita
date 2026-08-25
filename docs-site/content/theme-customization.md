---
title: 主题使用与扩展
---

# 主题使用与扩展

主题是一个独立的 npm 包，除了视觉样式，还可以声明自己需要的插件和页面布局。站点通过配置选择主题，主题包由站点项目直接安装。

## 安装主题

~~~bash
pnpm add -D @cogita/theme-docs
~~~

然后在 `cogita.config.ts` 中指定：

~~~ts
export default defineConfig({
  theme: '@cogita/theme-docs',
});
~~~

## 主题配置

主题可以通过 `themeConfig` 接收站点级选项。导航、侧边栏和主题专属选项都应该集中放在这里，不要把主题实现细节写入 Core 配置。

## 内置主题概览

| 主题包 | 适用场景 | 视觉定位 |
| --- | --- | --- |
| `@cogita/theme-docs` | Cogita 使用手册 | 文档导航、侧边栏与 API 阅读 |
| `@cogita/theme-lucid` | 独立博客与内容站点 | 轻量 Hero、文章卡片与内容侧栏 |
| `@cogita/theme-editorial` | 内容优先的技术博客 | 编辑感排版、主推文章与专题阅读 |

主题是站点的渲染边界：Core 负责配置、路由和构建，插件负责数据，主题负责如何组织这些数据。新增主题时，应优先新增主题包和主题专属配置，不要把视觉判断下沉到 Core。

### Lucid 主题配置

Lucid 从 `site.title`、`site.description` 读取站点品牌信息，并通过 `themeConfig.lucid` 接收自身配置：

~~~ts
export default defineConfig({
  theme: '@cogita/theme-lucid',
  site: {
    title: '我的技术笔记',
    description: '记录构建、调试和持续思考的过程。',
  },
  themeConfig: {
    lucid: {
      heroEyebrow: 'My Notes',
      heroCopy: '把长期实践整理成可复用的文章。',
      postsTitle: '最近更新',
      showSidebar: true,
      featuredPost: '/posts/introducing-cogita',
    },
  },
});
~~~

`heroEyebrow`、`heroCopy`、`postsTitle`、`showSidebar` 和 `featuredPost` 都是可选项。未配置时，Lucid 使用稳定默认值；标签、分类、合集、搜索等能力仍由对应插件决定。

## 替换与扩展

如果需要改变页面结构，可以创建自己的主题包，复用共享类型和 UI 组件，并在主题包内声明所需插件。站点只需要把 `theme` 切换为新包即可；文章内容和框架包不需要迁移。

主题的布局契约、插件依赖和解析流程详见[主题开发指南](./theme-development.md)与[架构设计](./api/architecture-design.md)。
