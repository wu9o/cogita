import { useEffect } from 'react';
import type React from 'react';
import { codeCopyConfig } from 'virtual-code-copy-data';

interface EnhancedCodeBlock {
  button: HTMLButtonElement;
  pre: HTMLElement;
  onClick: () => void;
}

interface EnhancedNativeCopyButton {
  button: HTMLButtonElement;
  pre: HTMLElement;
  title: string | null;
  ariaLabel: string | null;
  copyState: string | null;
  onClick: (event: MouseEvent) => void;
}

interface CopyToastController {
  show(message: string, state: 'success' | 'error'): void;
  destroy(): void;
}

/** 创建页面级复制提示，避免让代码按钮自身堆叠成功状态。 */
function createCopyToast(): CopyToastController {
  const toast = document.createElement('div');
  let hideTimer: number | undefined;

  toast.className = 'cogita-copy-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  return {
    show(message, state) {
      if (hideTimer) window.clearTimeout(hideTimer);
      toast.textContent = message;
      toast.dataset.state = state;
      toast.dataset.visible = 'true';
      hideTimer = window.setTimeout(() => {
        toast.dataset.visible = 'false';
      }, codeCopyConfig.resetDelay);
    },
    destroy() {
      if (hideTimer) window.clearTimeout(hideTimer);
      toast.remove();
    },
  };
}

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
    if (!document.execCommand('copy')) {
      throw new Error('The browser rejected the copy command');
    }
  } finally {
    textarea.remove();
  }
}

/** 获取代码块中不包含复制按钮的正文。 */
function getCodeText(pre: HTMLElement): string {
  return pre.querySelector('code')?.textContent || '';
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

/** 获取代码块声明的语言名称。 */
function getCodeLanguage(pre: HTMLElement): string | null {
  const codeClassName = String(pre.querySelector('code')?.className || '');
  return codeClassName.match(/(?:^|\s)language-([^\s]+)/)?.[1] || null;
}

/** 获取代码块未选中内容时应该展示的复制提示。 */
function getCopyLabel(pre: HTMLElement): string {
  const language = getCodeLanguage(pre);
  if (!language) return codeCopyConfig.buttonLabel;
  return codeCopyConfig.languageLabel.replace('{language}', language);
}

/** 获取代码块当前应该展示的复制提示。 */
function getIdleCopyLabel(pre: HTMLElement): string {
  return getSelectedCodeText(pre) ? codeCopyConfig.selectionLabel : getCopyLabel(pre);
}

/** 获取 Rspress 已提供的原生复制按钮。 */
function getNativeCopyButton(pre: HTMLElement): HTMLButtonElement | null {
  const codeContent = pre.closest<HTMLElement>('.rspress-code-content');
  return (
    codeContent?.querySelector<HTMLButtonElement>(
      'button[title="Copy code"]:not(.cogita-code-copy), button[aria-label="Copy code"]:not(.cogita-code-copy), button[class*="code-copy-button"]:not(.cogita-code-copy)'
    ) || null
  );
}

/** 移除已经挂载、但后来被 Rspress 原生按钮替代的自定义按钮。 */
function removeEnhancedBlock(pre: HTMLElement, enhancedBlocks: EnhancedCodeBlock[]): void {
  const enhancedIndex = enhancedBlocks.findIndex((block) => block.pre === pre);
  if (enhancedIndex === -1) return;

  const [enhancedBlock] = enhancedBlocks.splice(enhancedIndex, 1);
  enhancedBlock.button.removeEventListener('click', enhancedBlock.onClick);
  enhancedBlock.button.remove();
  pre.classList.remove('cogita-code-block');
}

/** 更新 Rspress 原生按钮的可访问提示，但不改变按钮的视觉状态。 */
function setNativeCopyLabel(enhancedButton: EnhancedNativeCopyButton, label: string): void {
  if (enhancedButton.button.title !== label) enhancedButton.button.title = label;
  if (enhancedButton.button.getAttribute('aria-label') !== label) {
    enhancedButton.button.setAttribute('aria-label', label);
  }
}

/** 为页面中的代码块挂载复制按钮。 */
function enhanceCodeBlocks(
  root: ParentNode,
  enhancedBlocks: EnhancedCodeBlock[],
  nativeCopyButtons: EnhancedNativeCopyButton[],
  toast: CopyToastController
): void {
  const selectedElements = Array.from(root.querySelectorAll<HTMLElement>(codeCopyConfig.selector));
  const codeBlocks = new Set<HTMLElement>();

  for (const selectedElement of selectedElements) {
    const pre = selectedElement.matches('pre')
      ? selectedElement
      : selectedElement.closest<HTMLElement>('pre');
    if (pre) codeBlocks.add(pre);
  }

  for (const pre of codeBlocks) {
    const trackedNativeCopyButton = nativeCopyButtons.find(
      ({ pre: trackedPre }) => trackedPre === pre
    );
    const nativeCopyButton = trackedNativeCopyButton?.button || getNativeCopyButton(pre);
    if (nativeCopyButton) {
      removeEnhancedBlock(pre, enhancedBlocks);
      if (!trackedNativeCopyButton) {
        const enhancedButton = {
          button: nativeCopyButton,
          pre,
          title: nativeCopyButton.getAttribute('title'),
          ariaLabel: nativeCopyButton.getAttribute('aria-label'),
          copyState: nativeCopyButton.dataset.copyState || null,
          onClick: (_event: MouseEvent) => undefined,
        } as EnhancedNativeCopyButton;

        enhancedButton.onClick = (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          void (async () => {
            try {
              await copyText(getSelectedCodeText(pre) || getCodeText(pre));
              toast.show(codeCopyConfig.copiedLabel, 'success');
            } catch {
              toast.show(codeCopyConfig.errorLabel, 'error');
            }
          })();
        };

        nativeCopyButton.addEventListener('click', enhancedButton.onClick, true);
        setNativeCopyLabel(enhancedButton, getIdleCopyLabel(pre));
        nativeCopyButtons.push(enhancedButton);
      }
      continue;
    }

    if (pre.querySelector('.cogita-code-copy')) continue;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cogita-code-copy';
    button.textContent = getIdleCopyLabel(pre);
    button.setAttribute('aria-label', getIdleCopyLabel(pre));
    pre.classList.add('cogita-code-block');
    pre.appendChild(button);

    const enhancedBlock: EnhancedCodeBlock = {
      button,
      pre,
      onClick: async () => {
        try {
          await copyText(getSelectedCodeText(pre) || getCodeText(pre));
          toast.show(codeCopyConfig.copiedLabel, 'success');
        } catch {
          toast.show(codeCopyConfig.errorLabel, 'error');
        }
      },
    };

    button.addEventListener('click', enhancedBlock.onClick);
    enhancedBlocks.push(enhancedBlock);
  }
}

/** 通过全局组件为文章代码块提供复制交互。 */
const CodeCopy: React.FC = () => {
  useEffect(() => {
    if (!codeCopyConfig.enabled || typeof document === 'undefined') return;

    const enhancedBlocks: EnhancedCodeBlock[] = [];
    const nativeCopyButtons: EnhancedNativeCopyButton[] = [];
    const toast = createCopyToast();
    const updateButtonLabels = () => {
      for (const block of enhancedBlocks) {
        const label = getIdleCopyLabel(block.pre);
        if (block.button.textContent !== label) block.button.textContent = label;
        if (block.button.getAttribute('aria-label') !== label) {
          block.button.setAttribute('aria-label', label);
        }
      }
      for (const block of nativeCopyButtons) {
        setNativeCopyLabel(block, getIdleCopyLabel(block.pre));
      }
    };
    const enhance = () => enhanceCodeBlocks(document, enhancedBlocks, nativeCopyButtons, toast);
    const observer = new MutationObserver(enhance);

    enhance();
    document.addEventListener('selectionchange', updateButtonLabels);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('selectionchange', updateButtonLabels);
      for (const { button, pre, onClick } of enhancedBlocks) {
        button.removeEventListener('click', onClick);
        button.remove();
        pre.classList.remove('cogita-code-block');
      }
      for (const { button, title, ariaLabel, copyState, onClick } of nativeCopyButtons) {
        button.removeEventListener('click', onClick, true);
        if (title === null) button.removeAttribute('title');
        else button.title = title;
        if (ariaLabel === null) button.removeAttribute('aria-label');
        else button.setAttribute('aria-label', ariaLabel);
        if (copyState === null) delete button.dataset.copyState;
        else button.dataset.copyState = copyState;
      }
      toast.destroy();
    };
  }, []);

  return null;
};

export default CodeCopy;
