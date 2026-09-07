# Code copy plugin design

## Goal

`@cogita/plugin-code-copy` adds a copy action to fenced code blocks on article pages:

- enhance `.rspress-doc pre` by default without modifying Markdown source;
- use `navigator.clipboard` first, with a native fallback;
- expose success and failure through button text and `aria-label`;
- use `MutationObserver` for client-side route changes and asynchronous rendering;
- detect Rspress's native copy action to avoid duplicate controls and add language hints;
- never send code content to a third party.

## Configuration

```ts
codeCopy: {
  enabled: true,
  selector: '.rspress-doc pre',
  buttonLabel: 'Copy code',
  selectionLabel: 'Copy selected code',
  languageLabel: 'Copy {language} code',
  copiedLabel: 'Copied',
  errorLabel: 'Copy failed',
  resetDelay: 2000,
}
```

Core fills the defaults. The plugin normalizes the config and generates `virtual-code-copy-data`. Even when disabled, it generates a disabled-state module so the theme can import it safely.

## Data flow and boundary

```text
cogita.config.ts
       ↓
Core fills code-copy defaults
       ↓
The plugin generates virtual-code-copy-data
       ↓
Lucid's global component observes article DOM
       ↓
Check for the native Rspress action
       ↓
Mount buttons only on pre elements without a copy action
```

The plugin does not parse Markdown at build time and does not put code content into the virtual module. The theme component reads the rendered `code` text, so copied text matches the final DOM. Standard Rspress blocks keep their native action; the plugin only enhances custom blocks without one and tolerates asynchronous completion of Rspress button attributes.

## Interaction and safety

- Copy controls appear on hover or focus on desktop and remain visible on touch devices.
- `data-copy-state` and `aria-label` communicate state without relying on color alone.
- Copy failures show explicit feedback instead of being swallowed.
- Observers, timers, and dynamic buttons are cleaned up on unmount.
- Only the current page's code text is read; clipboard history and other pages are never accessed.
- A selection inside one code block is copied first. A cross-block selection or no selection copies the full block.

## Future work

- copy a single line or a filtered range by line number;
- test button contrast in both theme modes;
- cover the Clipboard API fallback in browser automation when the API is unavailable.

For the Chinese version, see [代码复制插件设计](../zh-CN/plugins/plugin-code-copy-design.html).
