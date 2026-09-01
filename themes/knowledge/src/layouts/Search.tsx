import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { useMemo, useState } from 'react';
import { t } from 'virtual-cogita-i18n-text';
import { searchConfig, searchDocuments } from 'virtual-search-data';
import { getBase, getHref, getKnowledgeCopy } from '../utils';

const SearchLayout: React.FC = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const copy = getKnowledgeCopy(pageData);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const meetsMinimumLength = normalizedQuery.length >= searchConfig.minQueryLength;
  const results = useMemo(() => {
    if (!meetsMinimumLength) return [];
    return searchDocuments
      .map((entry) => {
        const haystack = [
          entry.title,
          entry.description,
          entry.excerpt,
          entry.content,
          ...(entry.tags || []),
          ...(entry.categories || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();
        const titleHit = entry.title.toLocaleLowerCase().includes(normalizedQuery);
        const score = titleHit ? 3 : haystack.includes(normalizedQuery) ? 1 : 0;
        return { entry, score };
      })
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, searchConfig.maxResults);
  }, [meetsMinimumLength, normalizedQuery]);

  return (
    <main className="knowledge-search">
      <header className="knowledge-search-header">
        <p className="knowledge-eyebrow">
          {copy.title} · {t('knowledge.search.eyebrow', 'SEARCH')}
        </p>
        <h1>{t('knowledge.search.title', '找到下一条相关知识。')}</h1>
        <p>{t('knowledge.search.description', '搜索文章、文档、标签和正文内容。')}</p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('knowledge.search.placeholder', '至少输入 {{count}} 个字符', {
            count: searchConfig.minQueryLength,
          })}
          aria-label={t('knowledge.search.ariaLabel', '搜索知识库')}
        />
      </header>

      <section className="knowledge-search-results" aria-live="polite">
        {!meetsMinimumLength && (
          <p className="knowledge-empty">
            {normalizedQuery
              ? t('knowledge.search.minLength', '请输入至少 {{count}} 个字符。', {
                  count: searchConfig.minQueryLength,
                })
              : t('knowledge.search.empty', '输入关键词开始探索。')}
          </p>
        )}
        {meetsMinimumLength && results.length === 0 && (
          <p className="knowledge-empty">
            {t('knowledge.search.noResults', '没有找到匹配的内容。')}
          </p>
        )}
        {results.map(({ entry }) => (
          <article key={entry.route} className="knowledge-search-result">
            <span>
              {entry.kind === 'document'
                ? t('knowledge.search.document', '文档')
                : t('knowledge.search.post', '文章')}
            </span>
            <h2>
              <a href={normalizeHrefInRuntime(getHref(base, entry.route))}>{entry.title}</a>
            </h2>
            <p>{entry.description || entry.excerpt || entry.content?.slice(0, 180)}</p>
            <div>
              {(entry.tags || []).slice(0, 4).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default SearchLayout;
