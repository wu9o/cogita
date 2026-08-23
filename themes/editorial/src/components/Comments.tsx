import { usePageData } from '@rspress/runtime';
import { useEffect, useRef, useState } from 'react';
import { commentsConfig } from 'virtual-comments-data';
import { getBase, getCurrentRoute } from '../utils';

/** 在文章页加载配置好的 Giscus 或 Utterances 评论组件。 */
export default function Comments() {
  const pageData = usePageData();
  const route = getCurrentRoute(getBase(pageData));
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const enabled = commentsConfig.enabled && commentsConfig.postRoutes.includes(route);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    setState('loading');
    script.addEventListener('load', () => setState('ready'));
    script.addEventListener('error', () => setState('error'));

    if (commentsConfig.provider === 'giscus') {
      script.src = 'https://giscus.app/client.js';
      for (const [key, value] of Object.entries(commentsConfig.giscus)) {
        script.setAttribute(
          `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
          String(value)
        );
      }
    } else {
      script.src = 'https://utteranc.es/client.js';
      for (const [key, value] of Object.entries(commentsConfig.utterances)) {
        script.setAttribute(
          `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
          String(value)
        );
      }
    }

    containerRef.current.appendChild(script);
    return () => {
      script.remove();
      if (containerRef.current) containerRef.current.replaceChildren();
      setState('idle');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <section className="editorial-comments" aria-labelledby="editorial-comments-title">
      <h2 id="editorial-comments-title">{commentsConfig.title}</h2>
      {state === 'loading' && <p>正在加载评论服务…</p>}
      {state === 'error' && <p role="alert">评论服务暂时不可用，请稍后重试。</p>}
      <div ref={containerRef} />
    </section>
  );
}
