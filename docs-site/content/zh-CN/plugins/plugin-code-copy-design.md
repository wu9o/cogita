# 代码复制插件设计

## 目标

`@cogita/plugin-code-copy` 为文章页的 fenced code block 添加复制按钮，提供以下能力：

- 默认增强 `.rspress-doc pre`，不修改 Markdown 源文件；
- 优先使用浏览器 `navigator.clipboard`，不支持时回退到原生复制命令；
- 通过按钮文案和 `aria-label` 暴露复制成功、失败状态；
- 通过 `MutationObserver` 兼容 Rspress 的客户端路由切换和异步渲染；
- 识别 Rspress 已提供的原生复制按钮，避免同一个代码块出现重复操作，并补充语言级提示；
- 不发送代码内容，不依赖第三方服务。

## 配置

```ts
codeCopy: {
  enabled: true,
  selector: '.rspress-doc pre',
  buttonLabel: '复制代码',
  selectionLabel: '复制选中代码',
  languageLabel: '复制 {language} 代码',
  copiedLabel: '已复制',
  errorLabel: '复制失败',
  resetDelay: 2000,
}
```

核心层负责补齐默认配置，插件只负责规范化配置并生成 `virtual-code-copy-data`。`enabled: false` 时仍生成关闭状态模块，让主题可以安全静态导入。

## 数据流与边界

```text
cogita.config.ts
       ↓
core 补齐 codeCopy 默认配置
       ↓
代码复制插件生成 virtual-code-copy-data
       ↓
Lucid 全局组件监听文章 DOM
       ↓
检查 Rspress 原生复制能力
       ↓
仅为缺少复制操作的 pre 元素挂载按钮
```

插件不在构建期解析 Markdown，也不把代码内容写入虚拟模块。主题组件只读取 `code` 元素的运行时文本，因此复制内容与最终渲染结果保持一致。对于 Rspress 标准代码块，优先保留其原生复制操作，只修改复制按钮的提示文案；插件只增强没有原生复制能力的自定义代码块，并兼容 Rspress 按钮属性异步补全的过程。

## 交互与安全

- 复制按钮默认只在代码块悬停或获得焦点时显示，触摸设备保持可见；
- 复制状态通过 `data-copy-state` 和 `aria-label` 表达，避免只依赖颜色；
- 复制失败显示明确的失败文案，不吞掉用户反馈；
- 监听器、定时器和动态按钮在组件卸载时清理；
- 只读取当前页面代码块文本，不访问剪贴板历史或其他页面数据。
- 选中内容位于代码块内部时优先复制选中内容；选择跨出代码块或没有选中内容时复制完整代码块。

## 二期建设

- 支持选中代码内容后的一键复制；
- 保留 Rspress 的原生复制按钮，不引入额外的行号覆盖层，避免破坏代码块的换行和主题渲染；

## 后续建设

- 支持一键复制单行代码和代码块行号过滤；
- 与主题明暗模式的按钮对比度测试；
- 在浏览器自动化测试中覆盖 Clipboard API 不可用的回退路径。
