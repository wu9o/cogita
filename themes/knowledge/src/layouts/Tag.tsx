import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allTags, getRelatedTags, tagsConfig } from 'virtual-tags-data';
import { getBase, getHref, getKnowledgeCopy, getPageRoute } from '../utils';

const TagLayout: React.FC = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const prefix = tagsConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  const slug = route.startsWith(`${prefix}/`) ? route.slice(prefix.length + 1) : '';
  const tag = allTags.find((item) => item.slug === slug);
  const copy = getKnowledgeCopy(pageData);

  if (!slug) {
    return (
      <main className="knowledge-tag-page">
        <header className="knowledge-page-header">
          <p className="knowledge-eyebrow">{copy.title} · TOPICS</p>
          <h1>按主题探索</h1>
          <p>标签把分散的文章和文档聚合成可复用的知识入口。</p>
        </header>
        <div className="knowledge-all-tags">
          {allTags.map((item) => (
            <a key={item.slug} href={normalizeHrefInRuntime(getHref(base, item.route))}>
              <strong>{item.name}</strong>
              <span>{item.count} 条内容</span>
            </a>
          ))}
        </div>
      </main>
    );
  }

  if (!tag) {
    return (
      <main className="knowledge-tag-page">
        <a href={normalizeHrefInRuntime(getHref(base, `/${prefix}`))}>← 返回全部主题</a>
        <h1>主题不存在</h1>
      </main>
    );
  }

  const relatedTags = getRelatedTags(tag.name, 8);
  return (
    <main className="knowledge-tag-page">
      <header className="knowledge-page-header">
        <a href={normalizeHrefInRuntime(getHref(base, `/${prefix}`))}>← 返回全部主题</a>
        <p className="knowledge-eyebrow">TOPIC</p>
        <h1>#{tag.name}</h1>
        <p>{tag.count} 条内容围绕这个主题展开。</p>
      </header>
      <div className="knowledge-tag-entries">
        {tag.posts.map((entry) => (
          <a key={entry.route} href={normalizeHrefInRuntime(getHref(base, entry.route))}>
            <strong>{entry.title}</strong>
            <span>{entry.description || '打开条目继续阅读。'}</span>
          </a>
        ))}
      </div>
      {relatedTags.length > 0 && (
        <section className="knowledge-related-tags">
          <h2>相关主题</h2>
          <div>
            {relatedTags.map((item) => (
              <a key={item.slug} href={normalizeHrefInRuntime(getHref(base, item.route))}>
                #{item.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default TagLayout;
