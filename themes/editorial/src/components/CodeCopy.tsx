import { useEffect } from 'react';
import { codeCopyConfig } from 'virtual-code-copy-data';

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  if (!document.execCommand('copy')) throw new Error('复制失败');
  textarea.remove();
}

/** 为代码块提供主题化复制按钮，并兼容 Rspress 动态生成的代码块。 */
export default function CodeCopy() {
  useEffect(() => {
    if (!codeCopyConfig.enabled) return;

    const buttons = new Map<HTMLButtonElement, () => void>();
    const enhance = () => {
      for (const pre of Array.from(
        document.querySelectorAll<HTMLElement>(codeCopyConfig.selector)
      )) {
        const block = pre.matches('pre') ? pre : (pre.closest('pre') as HTMLElement | null);
        if (!block || block.querySelector('.editorial-code-copy')) continue;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'editorial-code-copy';
        button.textContent = codeCopyConfig.buttonLabel;
        const onClick = async () => {
          try {
            await copyText(block.querySelector('code')?.textContent || '');
            button.textContent = codeCopyConfig.copiedLabel;
          } catch {
            button.textContent = codeCopyConfig.errorLabel;
          }
          window.setTimeout(() => {
            button.textContent = codeCopyConfig.buttonLabel;
          }, codeCopyConfig.resetDelay);
        };

        button.addEventListener('click', onClick);
        block.appendChild(button);
        buttons.set(button, onClick);
      }
    };

    const observer = new MutationObserver(enhance);
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const [button, onClick] of buttons) {
        button.removeEventListener('click', onClick);
        button.remove();
      }
    };
  }, []);

  return null;
}
