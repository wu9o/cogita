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

## 替换与扩展

如果需要改变页面结构，可以创建自己的主题包，复用共享类型和 UI 组件，并在主题包内声明所需插件。站点只需要把 `theme` 切换为新包即可；文章内容和框架包不需要迁移。

主题的布局契约、插件依赖和解析流程详见[主题开发指南](./theme-development.md)与[架构设计](./api/architecture-design.md)。
