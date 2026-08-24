import { useEffect } from 'react';
import { codeCopyConfig } from 'virtual-code-copy-data';

/** 使用浏览器剪贴板 API 复制文本，并在不支持时回退到原生命令。 */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) throw new Error('复制失败');
  } finally {
    textarea.remove();
  }
}

/** 读取代码块内的选中内容，跨出代码块的选择不参与复制。 */
function getSelectedCodeText(pre: HTMLElement): string | null {
  const code = pre.querySelector<HTMLElement>('code');
  const selection = window.getSelection();
  if (!code || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  if (!code.contains(range.commonAncestorContainer)) return null;

  const selectedText = selection.toString();
  return selectedText.trim() ? selectedText : null;
}

/** 判断当前页面是否选中了指定代码块中的内容。 */
function hasSelectedCode(pre: HTMLElement): boolean {
  return getSelectedCodeText(pre) !== null;
}

/** 获取代码块当前应该展示的按钮文案。 */
function getIdleLabel(pre: HTMLElement): string {
  return hasSelectedCode(pre) ? codeCopyConfig.selectionLabel : codeCopyConfig.buttonLabel;
}

interface EditorialCodeCopyState {
  block: HTMLElement;
  onClick: () => Promise<void>;
  resetTimer?: number;
}

/** 为代码块提供主题化复制按钮，并兼容 Rspress 动态生成的代码块。 */
export default function CodeCopy() {
  useEffect(() => {
    if (!codeCopyConfig.enabled) return;

    const buttons = new Map<HTMLButtonElement, EditorialCodeCopyState>();
    const updateButtonLabels = () => {
      for (const [button, state] of buttons) {
        if (button.dataset.copyState !== 'idle') continue;
        const label = getIdleLabel(state.block);
        if (button.textContent !== label) button.textContent = label;
        if (button.getAttribute('aria-label') !== label) {
          button.setAttribute('aria-label', label);
        }
      }
    };
    const enhance = () => {
      for (const pre of Array.from(
        document.querySelectorAll<HTMLElement>(codeCopyConfig.selector)
      )) {
        const block = pre.matches('pre') ? pre : (pre.closest('pre') as HTMLElement | null);
        if (!block || block.querySelector('.editorial-code-copy')) continue;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'editorial-code-copy';
        button.dataset.copyState = 'idle';
        const state: EditorialCodeCopyState = {
          block,
          onClick: async () => {
            try {
              const code = block.querySelector('code')?.textContent || '';
              await copyText(getSelectedCodeText(block) || code);
              button.textContent = codeCopyConfig.copiedLabel;
              button.setAttribute('aria-label', codeCopyConfig.copiedLabel);
              button.dataset.copyState = 'copied';
            } catch {
              button.textContent = codeCopyConfig.errorLabel;
              button.setAttribute('aria-label', codeCopyConfig.errorLabel);
              button.dataset.copyState = 'error';
            }
            if (state.resetTimer) window.clearTimeout(state.resetTimer);
            state.resetTimer = window.setTimeout(() => {
              const label = getIdleLabel(block);
              button.textContent = label;
              button.setAttribute('aria-label', label);
              button.dataset.copyState = 'idle';
            }, codeCopyConfig.resetDelay);
          },
        };

        button.textContent = getIdleLabel(block);
        button.setAttribute('aria-label', getIdleLabel(block));
        button.addEventListener('click', state.onClick);
        block.appendChild(button);
        buttons.set(button, state);
      }
      updateButtonLabels();
    };

    const observer = new MutationObserver(enhance);
    enhance();
    document.addEventListener('selectionchange', updateButtonLabels);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.removeEventListener('selectionchange', updateButtonLabels);
      for (const [button, state] of buttons) {
        button.removeEventListener('click', state.onClick);
        if (state.resetTimer) window.clearTimeout(state.resetTimer);
        button.remove();
      }
    };
  }, []);

  return null;
}
