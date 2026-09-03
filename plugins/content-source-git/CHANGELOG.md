# @cogita/plugin-content-source-git

## 0.2.0

### Minor Changes

- 53e62d8: 为外部内容源增加静态资源发布契约，Git Markdown 内容源会自动发布并改写正文中的相对图片和资源引用。
- 40122e0: 增加独立 Git checkout Markdown 内容源适配器，将外部内容仓库接入统一 ContentIndex。

### Patch Changes

- 81ac217: 让 Git Markdown 内容源安全处理并行的正文、资源和内容加载，并在下一轮构建时刷新快照。
- Updated dependencies [657fc43]
- Updated dependencies [53e62d8]
- Updated dependencies [b8cf7c8]
- Updated dependencies [d270384]
  - @cogita/shared@0.13.0
