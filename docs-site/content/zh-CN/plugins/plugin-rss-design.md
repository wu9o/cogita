---
title: RSS 插件设计
---

# RSS 插件设计

`@cogita/plugin-rss` 根据共享 `ContentIndex` 生成 RSS 2.0、Atom 和 JSON Feed，并把 feed 发现链接注入 HTML。它让博客可以被订阅器、阅读器和自动化工具持续消费。

## 能力

- 生成 RSS 2.0、Atom 和 JSON Feed；
- 控制输出格式、路径、条数和是否包含正文；
- 映射作者、分类等自定义字段；
- 为页面注入 `rel="alternate"` feed 链接；
- 与站点语言和 `base` 路径保持一致。

## 配置

```ts
export default defineConfig({
  rss: {
    title: 'My Blog Feed',
    description: 'Latest articles',
    link: 'https://example.com',
    language: 'en-US',
    formats: ['rss', 'atom', 'json'],
    maxItems: 20,
    includeContent: true,
  },
});
```

`feedPath`、`atomPath` 和 `jsonPath` 分别默认为 `rss.xml`、`atom.xml` 和 `feed.json`。配置由 Core 传入插件，插件不应重复读取配置文件。

## 数据流

```text
ContentIndex → Feed item mapping → RSS/Atom/JSON → static output + HTML discovery links
```

插件优先使用 Core 提供的索引；单独运行或旧版索引不可用时可以保留 frontmatter 扫描兜底。文章路由、标题、摘要、发布日期和公开 URL 必须来自统一内容数据。

## 生命周期与边界

`beforeBuild` 阶段规范化配置并准备 feed 元数据，`addPages` 阶段写出静态 feed 文件，`addRuntimeModules` 阶段可提供 feed URL 元数据，HTML 修改钩子负责插入发现链接。插件不负责文章扫描、主题布局或客户端订阅界面。

生成器必须正确转义 XML 和 JSON 字段，并使用站点 `base` 生成公开 URL；不要把 `assetPrefix` 当作 feed 路径。无文章时仍应生成合法的空 feed。

## 兼容性与验证

feed 输出应使用稳定的 `guid`、公开绝对链接和 ISO/HTTP 日期格式。建议在构建后验证 RSS、Atom、JSON 三种文件都存在、XML 可解析、链接不包含本机路径，并在子路径部署下检查发现链接。

相关契约见[内容索引设计](../api/content-index-design.html)、[插件 API 规范](./plugin-api-specification.html)和[英文版本](../../plugins/plugin-rss-design.html)。
