# @cogita/plugin-images

为 Cogita 提供公共图片清单、文章封面校验、使用统计和 `virtual-images-data` 运行时模块。

该插件声明依赖 `content.posts` 能力，通过 Core 注入的共享内容索引读取文章封面信息，不直接依赖文章扫描插件。

第一阶段只扫描项目 `public/images` 下的图片。文章 frontmatter 可以使用：

```yaml
image: /images/example.png
imageAlt: 示例图片
imageCaption: 图片说明
```

Markdown 正文中的相对图片仍由 Rspress 原生处理。

二期 A 增加了可选的封面可访问性提示和使用关系索引：

```ts
images: {
  warnOnMissingAlt: true,
}
```

运行时可以从 `virtual-images-data` 读取 `imageUsage`，并通过 `getUnusedImages()` 找到没有被文章封面引用的公共图片。正文图片的 `figure`、说明文字和 lightbox 交互仍属于后续阶段。

Rspress 已内置图片放大能力，Cogita 通过顶层 `mediumZoom` 配置透传其选择器和选项，不在图片插件中重复引入交互依赖：

```ts
mediumZoom: {
  selector: '.rspress-doc p > img',
}
```
