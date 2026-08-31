import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { useMemo } from 'react';
import { contentRelations } from 'virtual-content-relations-data';
import { searchConfig, searchDocuments } from 'virtual-search-data';
import { allTags, tagsConfig } from 'virtual-tags-data';
import { getBase, getHref, getKnowledgeCopy } from '../utils';

const HomeLayout: React.FC = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const copy = getKnowledgeCopy(pageData);
  const recentEntries = useMemo(
    () =>
      [...searchDocuments]
        .sort((left, right) => right.updateDate.localeCompare(left.updateDate))
        .slice(0, 8),
    []
  );
  const relationCount = contentRelations.reduce(
    (total, relation) => total + relation.outbound.length,
    0
  );

  return (
    <main className="knowledge-home">
      <section className="knowledge-hero">
        <div>
          <p className="knowledge-eyebrow">{copy.title} · KNOWLEDGE BASE</p>
          <h1>{copy.description}</h1>
          <p className="knowledge-lead">
            用统一内容索引连接文章与文档，让每一次阅读都能自然抵达下一条相关知识。
          </p>
          <nav className="knowledge-actions" aria-label="知识库导航">
            <a href={normalizeHrefInRuntime(getHref(base, '/search'))}>搜索知识</a>
            <a href={normalizeHrefInRuntime(getHref(base, `/${tagsConfig.routePrefix}`))}>
              浏览标签
            </a>
          </nav>
        </div>
        <div className="knowledge-stats" aria-label="知识库统计">
          <div>
            <strong>{searchDocuments.length}</strong>
            <span>内容条目</span>
          </div>
          <div>
            <strong>{allTags.length}</strong>
            <span>主题标签</span>
          </div>
          <div>
            <strong>{relationCount}</strong>
            <span>内容连接</span>
          </div>
        </div>
      </section>

      <div className="knowledge-grid">
        <section className="knowledge-recent" aria-labelledby="knowledge-recent-title">
          <div className="knowledge-section-heading">
            <div>
              <p className="knowledge-section-label">Recently updated</p>
              <h2 id="knowledge-recent-title">最近更新</h2>
            </div>
            <a href={normalizeHrefInRuntime(getHref(base, '/search'))}>查看全部 →</a>
          </div>
          <div className="knowledge-entry-list">
            {recentEntries.map((entry) => (
              <a
                key={entry.route}
                href={normalizeHrefInRuntime(getHref(base, entry.route))}
                className="knowledge-entry-card"
              >
                <span className="knowledge-entry-kind">
                  {entry.kind === 'document' ? '文档' : '文章'}
                </span>
                <strong>{entry.title}</strong>
                <p>{entry.description || entry.excerpt || '打开条目继续阅读。'}</p>
                <small>{entry.updateDate.slice(0, 10)}</small>
              </a>
            ))}
          </div>
        </section>

        <aside className="knowledge-discovery">
          <section className="knowledge-discovery-card">
            <div className="knowledge-section-heading compact">
              <div>
                <p className="knowledge-section-label">Explore</p>
                <h2>按主题探索</h2>
              </div>
              <span>{allTags.length}</span>
            </div>
            <div className="knowledge-tag-list">
              {allTags.slice(0, 18).map((tag) => (
                <a key={tag.slug} href={normalizeHrefInRuntime(getHref(base, tag.route))}>
                  {tag.name}
                  <span>{tag.count}</span>
                </a>
              ))}
            </div>
          </section>
          <section className="knowledge-discovery-card knowledge-search-card">
            <p className="knowledge-section-label">Find anything</p>
            <h2>从一个关键词开始。</h2>
            <p>全文索引 {searchDocuments.length} 个内容条目。</p>
            <a href={normalizeHrefInRuntime(getHref(base, `/${searchConfig.routePrefix}`))}>
              打开搜索 →
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default HomeLayout;
