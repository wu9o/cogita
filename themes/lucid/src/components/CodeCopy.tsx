import { useEffect } from 'react';
import type React from 'react';
import { codeCopyConfig } from 'virtual-code-copy-data';

interface EnhancedCodeBlock {
  button: HTMLButtonElement;
  pre: HTMLElement;
  onClick: () => void;
  resetTimer?: number;
}

interface EnhancedNativeCopyButton {
  button: HTMLButtonElement;
  title: string | null;
  ariaLabel: string | null;
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
      throw new Error('浏览器拒绝执行复制命令');
    }
  } finally {
    textarea.remove();
  }
}

/** 获取代码块中不包含复制按钮的正文。 */
function getCodeText(pre: HTMLElement): string {
  return pre.querySelector('code')?.textContent || '';
}

/** 获取代码块声明的语言名称。 */
function getCodeLanguage(pre: HTMLElement): string | null {
  const codeClassName = String(pre.querySelector('code')?.className || '');
  return codeClassName.match(/(?:^|\s)language-([^\s]+)/)?.[1] || null;
}

/** 获取代码块应该展示的复制提示。 */
function getCopyLabel(pre: HTMLElement): string {
  const language = getCodeLanguage(pre);
  if (!language) return codeCopyConfig.buttonLabel;
  return codeCopyConfig.languageLabel.replace('{language}', language);
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
  if (enhancedBlock.resetTimer) window.clearTimeout(enhancedBlock.resetTimer);
  enhancedBlock.button.remove();
  pre.classList.remove('cogita-code-block');
}

/** 为页面中的代码块挂载复制按钮。 */
function enhanceCodeBlocks(
  root: ParentNode,
  enhancedBlocks: EnhancedCodeBlock[],
  nativeCopyButtons: EnhancedNativeCopyButton[]
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
    const nativeCopyButton = getNativeCopyButton(pre);
    if (nativeCopyButton) {
      removeEnhancedBlock(pre, enhancedBlocks);
      if (!nativeCopyButtons.some(({ button }) => button === nativeCopyButton)) {
        nativeCopyButtons.push({
          button: nativeCopyButton,
          title: nativeCopyButton.getAttribute('title'),
          ariaLabel: nativeCopyButton.getAttribute('aria-label'),
        });
        const label = getCopyLabel(pre);
        nativeCopyButton.title = label;
        nativeCopyButton.setAttribute('aria-label', label);
      }
      continue;
    }

    if (pre.querySelector('.cogita-code-copy')) continue;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cogita-code-copy';
    button.textContent = getCopyLabel(pre);
    button.setAttribute('aria-label', getCopyLabel(pre));
    button.dataset.copyState = 'idle';
    pre.classList.add('cogita-code-block');
    pre.appendChild(button);

    const enhancedBlock: EnhancedCodeBlock = {
      button,
      pre,
      onClick: async () => {
        try {
          await copyText(getCodeText(pre));
          button.textContent = codeCopyConfig.copiedLabel;
          button.setAttribute('aria-label', codeCopyConfig.copiedLabel);
          button.dataset.copyState = 'copied';
        } catch {
          button.textContent = codeCopyConfig.errorLabel;
          button.setAttribute('aria-label', codeCopyConfig.errorLabel);
          button.dataset.copyState = 'error';
        }

        if (enhancedBlock.resetTimer) window.clearTimeout(enhancedBlock.resetTimer);
        enhancedBlock.resetTimer = window.setTimeout(() => {
          const label = getCopyLabel(pre);
          button.textContent = label;
          button.setAttribute('aria-label', label);
          button.dataset.copyState = 'idle';
        }, codeCopyConfig.resetDelay);
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
    const enhance = () => enhanceCodeBlocks(document, enhancedBlocks, nativeCopyButtons);
    const observer = new MutationObserver(enhance);

    enhance();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const { button, pre, onClick, resetTimer } of enhancedBlocks) {
        button.removeEventListener('click', onClick);
        if (resetTimer) window.clearTimeout(resetTimer);
        button.remove();
        pre.classList.remove('cogita-code-block');
      }
      for (const { button, title, ariaLabel } of nativeCopyButtons) {
        if (title === null) button.removeAttribute('title');
        else button.title = title;
        if (ariaLabel === null) button.removeAttribute('aria-label');
        else button.setAttribute('aria-label', ariaLabel);
      }
    };
  }, []);

  return null;
};

export default CodeCopy;
