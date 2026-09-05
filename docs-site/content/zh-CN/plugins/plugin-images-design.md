---
title: 图片插件架构设计
---

# 图片插件架构设计

`@cogita/plugin-images` 提供图片资源发现、封面元数据和主题运行时数据。它解决“图片能稳定显示、路径可验证、主题可复用”的基础问题；压缩、格式转换和响应式图片属于后续的优化插件。

## 插件定位

| 插件 | 职责 |
| --- | --- |
| `@cogita/plugin-images` | 发现资源、解析路径、读取元数据、关联文章封面 |
| `@cogita/plugin-image-optimization` | 压缩、WebP/AVIF、响应式尺寸、缓存策略 |

第一阶段不重写 Rspress 的 Markdown 图片管线，也不把图片处理库和构建耗时带入基础安装。

## 资源边界

主题封面和运行时图片来自 `public/images`；文章正文的相对图片交给 Rspress 原生资源管线：

```text
blog/
├── public/images/          # 主题运行时图片，URL 形如 /images/cover.png
└── posts/article-slug/
    ├── index.md
    └── assets/              # 正文局部图片，由 Rspress 处理
```

支持 `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.avif` 和 `.svg`。生产构建时插件补齐公共图片目录的复制；局部图片的死链检查使用 Rspress 的 `markdown.image.checkDeadImages`。

## Frontmatter

```yaml
---
title: "文章标题"
image: "/images/cover.png"
imageAlt: "文章封面描述"
imageCaption: "文章封面说明"
---
```

`image` 支持公共逻辑路径或外部 URL。`imageAlt` 和 `imageCaption` 是可选展示元数据；缺少替代文本时可以使用标题或文件名降级，并在严格模式下诊断。

## 构建数据与运行时数据

绝对文件路径只能存在于构建进程，不能写入虚拟模块。构建阶段可以保留 `filePath`、尺寸和来源信息；主题运行时只接收不泄露本机目录的 `ImageData`：

```ts
export interface ImageData {
  src: string;
  relativePath?: string;
  name?: string;
  extension?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  source: 'public' | 'external';
  postRoute?: string;
}
```

插件通过 `virtual-images-data` 暴露 `allImages`、`postCovers`、`imageUsage`，以及按来源路径查询图片和未使用图片的函数。没有图片时也必须注册空数组和空映射，保证零配置主题可以安全导入。

## 路径规则

| 写法 | 处理方式 |
| --- | --- |
| Markdown `./assets/diagram.png` | 交给 Rspress 资源导入 |
| Frontmatter `/images/logo.png` | 从公共图片目录解析，只保存逻辑路径 |
| `https://example.com/a.png` | 外部 URL，不扫描和复制本地文件 |

虚拟模块中的 `src` 不拼接 `site.base`。运行时使用 Rspress 的 `normalizeImagePath` 处理子路径部署；`builderConfig.output.assetPrefix` 是 CDN 构建策略，不应当被当作站点 `base`。

## 配置

```ts
export interface ImagesConfig {
  enabled?: boolean;
  dir?: string;
  extensions?: string[];
  readDimensions?: boolean;
  failOnMissing?: boolean;
  warnOnMissingAlt?: boolean;
}
```

默认目录是 `public/images`，默认值由 Core 的增强配置补齐后传给插件。插件不应重复读取用户配置文件。

## 生命周期与集成

插件在 `beforeBuild` 阶段扫描公共图片、解析封面、读取尺寸并执行校验，在 `addRuntimeModules` 阶段生成稳定的 `virtual-images-data`。它不需要 `addPages`，因为图片不是独立页面；生产构建的公共资源复制在 `afterBuild` 完成。

图片插件应通过共享 `ContentIndex` 获取文章路由和 frontmatter，不读取另一个插件的运行时虚拟模块。主题负责声明插件并决定封面布局；Core 负责配置和构建上下文。

Lucid 主题和 `@cogita/ui` 可以使用轻量 `PostCover` 或 `ImageFigure` 组件：支持 `src`、`alt`、尺寸和说明文字，使用原生 `<img>` 与 CSS Modules。没有封面时不渲染空占位；后续优化插件可以在组件层增加 `srcset` 和 `<picture>`。

## 当前边界与后续

- 插件负责资源数据，主题负责视觉展示。
- 图片 URL 与本机文件路径分离，避免生成产物泄露开发机目录。
- 内容正文图片仍由 Rspress 处理，不重复实现 Markdown AST 扫描。
- 后续可增加响应式图片、压缩、格式转换、缓存和图片诊断报告。
