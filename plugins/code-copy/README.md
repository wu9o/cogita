# @cogita/plugin-code-copy

Add an accessible copy button to code blocks on Cogita article pages. The plugin has no third-party service dependency, is enabled by default, and exposes normalized configuration to themes through `virtual-code-copy-data`.

## Configuration

```ts
export default defineConfig({
  codeCopy: {
    enabled: true,
    selector: '.rspress-doc pre',
    buttonLabel: 'Copy code',
    selectionLabel: 'Copy selection',
    languageLabel: 'Copy {language} code',
    copiedLabel: 'Copied',
    errorLabel: 'Copy failed',
    resetDelay: 2000,
  },
});
```

The copy logic prefers `navigator.clipboard.writeText` and falls back to a temporary textarea and the browser's native copy command when unavailable. When part of a code block is selected, the button copies the selection; otherwise it copies the complete block. The button includes an `aria-label` and reports success or failure through status copy. `selectionLabel` indicates that selected text can be copied.

The Lucid theme recognizes the copy action already provided by standard Rspress code blocks to avoid duplicate controls. It adds a language-specific label based on the `language-xxx` class and only adds a button when a custom code block has no native copy control. `languageLabel` supports the `{language}` placeholder.

When `enabled` is `false`, the plugin still provides a disabled runtime module so themes can import it safely.
