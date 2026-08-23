# @cogita/plugin-code-copy

为 Cogita 文章页的代码块添加可访问的复制按钮。插件不依赖第三方服务，默认启用，并通过 `virtual-code-copy-data` 向主题暴露规范化配置。

## 配置

```ts
export default defineConfig({
  codeCopy: {
    enabled: true,
    selector: '.rspress-doc pre',
    buttonLabel: '复制代码',
    languageLabel: '复制 {language} 代码',
    copiedLabel: '已复制',
    errorLabel: '复制失败',
    resetDelay: 2000,
  },
});
```

复制逻辑优先使用 `navigator.clipboard.writeText`，不可用时回退到临时文本框和浏览器原生复制命令。按钮会提供 `aria-label`，并通过状态文案反馈成功或失败。

Lucid 主题会自动识别 Rspress 标准代码块已有的复制操作，避免重复渲染，并根据 `language-xxx` 类名补充语言级提示；自定义代码块没有原生复制按钮时，才由插件补充按钮。`languageLabel` 支持 `{language}` 占位符。

将 `enabled` 设为 `false` 后，插件仍提供关闭状态的空运行时模块，主题可以安全静态导入。
