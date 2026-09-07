---
title: Cogita 最佳实践
---

# Cogita 最佳实践

本指南总结让 Cogita 站点易于演进的约定：清晰的仓库边界、精简配置、可组合的主题和插件、可靠的内容，以及可诊断的部署路径。

## 项目结构

站点内容应与框架包分离。站点仓库负责配置、内容、资源和本地扩展，Cogita 包作为依赖安装：

```text
my-site/
├── cogita.config.ts
├── package.json
├── content/
├── posts/
├── public/
├── components/
└── styles/
```

手册文档使用 `contentDir`，文章集合使用 `posts.dir`。Knowledge 可以同时展示两种内容，而 Docs 通常以 `contentDir` 为主要来源。

选择一种主要信息架构并保持 URL 稳定：日志或发布归档适合按时间组织，手册或参考资料适合按主题组织，只有在确实需要两种导航时才采用浅层混合结构。不要把临时工作流状态编码进公开 URL；草稿应使用专用目录或 frontmatter。

## 配置和英文优先

从最小可用配置开始，只在站点需要时增加能力：

```ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Northstar Handbook',
    description: 'A practical engineering handbook for product teams.',
    base: process.env.NODE_ENV === 'production' ? '/northstar/' : '/',
  },
  contentDir: 'content',
  theme: '@cogita/theme-docs',
});
```

让 `site` 负责品牌、语言、URL 和 base path；`contentDir` 与 `posts` 负责内容来源；`theme` 负责渲染系统；插件配置放在各自命名空间。

新安装应以英文作为默认回退，让消息字典不完整时站点仍可用：

```ts
export default defineConfig({
  i18n: {
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': { 'site.search': 'Search' },
      'zh-CN': { 'site.search': '搜索' },
    },
  },
});
```

`@cogita/plugin-i18n` 只翻译主题和插件的界面文案，不翻译 Markdown、文章标题或用户元数据。多语言内容应按站点内容策略独立编写和发布。

## 内容写作

为读者和机器同时维护简洁标题、有用描述和稳定日期。页面使用一个 `#` 标题和有意义的 `##` 层级；把结论放在前面；用短段落和列表提升可扫描性；为信息性图片提供替代文本；链接到下一篇相关页面，不要重复整段说明。

草稿不要进入生产构建。使用与生产相同的 base path 和主题进行本地预览：

```bash
pnpm run dev
pnpm run build
pnpm run preview
```

## 主题和插件

把主题视为渲染边界，把插件视为能力提供者：

```text
site config → Core → theme → plugins → static output
```

主题声明所需插件和布局；插件校验自己的命名空间，未配置时返回 `null`，并通过稳定虚拟模块提供构建数据。需要被多个主题复用的能力应做成插件；改变页面组成的能力应做成主题扩展；站点业务规则留在站点仓库。

## 构建和部署

静态站点最有价值的性能工作通常是减少无效构建，并保持输出可缓存：优先使用共享 `ContentIndex`，只有需要正文的功能才读取正文，并尽可能在元数据中保存图片尺寸和替代文本。

```bash
pnpm run build:packages
pnpm --filter docs-site build
pnpm run check:pages-artifact
```

GitHub Pages 流程应构建站点、检查暂存产物并发布生成目录。重点确认 `site.base` 与项目路径一致，导航链接都能解析，资源使用同一前缀，并且输出包含英文入口和主题 Demo。自定义域名通常使用 `/`，项目 Pages 则使用仓库路径。

## SEO、可访问性和排障

站点描述、页面描述和社交图片分别承担不同职责，不要把同一段描述复制到所有页面。使用语义化标题、可见焦点状态、键盘可操作控件以及搜索和语言控件的标签，不要只用颜色表达状态。

页面空白时先检查首个 SSG 错误，确认全局 UI 可在 Node 静态渲染中安全执行。主题或插件无法解析时，先重新构建工作区包，再核对包名和主题声明的依赖。
