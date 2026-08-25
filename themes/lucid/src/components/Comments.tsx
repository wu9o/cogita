import { usePageData } from '@rspress/runtime';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { commentsConfig } from 'virtual-comments-data';
import { getBase, getPageRoute } from '../utils';

function getGiscusAttributes() {
  const config = commentsConfig.giscus;
  const attributes: Record<string, string> = {
    'data-repo': config.repo,
    'data-repo-id': config.repoId,
    'data-category': config.category,
    'data-category-id': config.categoryId,
    'data-mapping': config.mapping,
    'data-strict': config.strict ? '1' : '0',
    'data-reactions-enabled': config.reactionsEnabled ? '1' : '0',
    'data-emit-metadata': config.emitMetadata ? '1' : '0',
    'data-input-position': config.inputPosition,
    'data-theme': config.theme,
    'data-lang': config.lang,
    'data-loading': config.loading,
  };

  if (config.term) {
    attributes['data-term'] = config.term;
  }

  return attributes;
}

function getUtterancesAttributes() {
  const config = commentsConfig.utterances;
  return {
    repo: config.repo,
    'issue-term': config.issueTerm === 'specific' ? config.term : config.issueTerm,
    label: config.label,
    theme: config.theme,
  };
}

function loadCommentsScript(container: HTMLDivElement, onLoad: () => void, onError: () => void) {
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.addEventListener('load', onLoad);
  script.addEventListener('error', onError);

  if (commentsConfig.provider === 'giscus') {
    script.src = 'https://giscus.app/client.js';
    for (const [name, value] of Object.entries(getGiscusAttributes())) {
      script.setAttribute(name, value);
    }
  } else {
    script.src = 'https://utteranc.es/client.js';
    for (const [name, value] of Object.entries(getUtterancesAttributes())) {
      script.setAttribute(name, value);
    }
  }

  container.appendChild(script);

  return () => {
    script.removeEventListener('load', onLoad);
    script.removeEventListener('error', onError);
  };
}

/** 在文章页按配置加载 Giscus 或 Utterances 评论区。 */
const Comments: React.FC = () => {
  const pageData = usePageData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptState, setScriptState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base);
  const isPostRoute = commentsConfig.postRoutes.includes(route);

  useEffect(() => {
    if (
      !commentsConfig.enabled ||
      !isPostRoute ||
      typeof document === 'undefined' ||
      !containerRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    container.dataset.route = route;
    setScriptState('loading');
    const removeScriptListeners = loadCommentsScript(
      container,
      () => setScriptState('ready'),
      () => setScriptState('error')
    );

    return () => {
      removeScriptListeners();
      container.replaceChildren();
      setScriptState('idle');
    };
  }, [isPostRoute, route]);

  if (!commentsConfig.enabled || !isPostRoute) {
    return null;
  }

  return (
    <section className="cogita-comments" aria-labelledby="cogita-comments-title">
      <h2 id="cogita-comments-title" className="cogita-comments-title">
        {commentsConfig.title}
      </h2>
      {scriptState === 'loading' && (
        <output className="cogita-comments-status" aria-live="polite">
          正在加载评论服务…
        </output>
      )}
      {scriptState === 'error' && (
        <p className="cogita-comments-status cogita-comments-status-error" role="alert">
          评论服务暂时不可用，请稍后重试。
        </p>
      )}
      <div
        ref={containerRef}
        className="cogita-comments-container"
        data-route={route}
        aria-busy={scriptState === 'loading'}
      />
    </section>
  );
};

export default Comments;
