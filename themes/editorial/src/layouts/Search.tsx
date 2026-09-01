import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { searchConfig, searchDocuments } from 'virtual-search-data';
import { t } from '../i18n';
import { formatDate, getBase } from '../utils';

function highlight(value: string, query: string): React.ReactNode {
  if (!query) return value;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = value.split(new RegExp(`(${escaped})`, 'giu'));
  return parts.map((part) =>
    part.toLocaleLowerCase() === query.toLocaleLowerCase() ? (
      <mark key={`${part}-${part.length}-${query}`}>{part}</mark>
    ) : (
      part
    )
  );
}

/** 文章搜索页面，保持搜索结果与主题文章列表相同的元信息层级。 */
const SearchLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined')
      setQuery(new URLSearchParams(window.location.search).get('q') || '');
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (normalized.length < searchConfig.minQueryLength) return [];

    return searchDocuments
      .map((document) => {
        const fields = [
          document.title,
          document.description,
          document.excerpt,
          document.content,
          ...(document.tags || []),
          ...(document.categories || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();
        const title = document.title.toLocaleLowerCase();
        const score =
          title === normalized
            ? 100
            : title.startsWith(normalized)
              ? 80
              : fields.includes(normalized)
                ? 20
                : 0;
        return { document, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) => b.score - a.score || b.document.updateDate.localeCompare(a.document.updateDate)
      )
      .slice(0, searchConfig.maxResults);
  }, [query]);

  return (
    <div className="editorial-index-page editorial-search-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Search</p>
        <h1>{t('editorial.search.title', 'Search articles')}</h1>
        <p>
          {t(
            'editorial.search.description',
            'Find content across titles, summaries, tags, and full text.'
          )}
        </p>
      </header>

      <form className="editorial-search-form" method="get">
        <label htmlFor="editorial-search-input">
          {t('editorial.search.inputLabel', 'Search term')}
        </label>
        <div>
          <input
            id="editorial-search-input"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('editorial.search.placeholder', 'Try: Git, React, architecture')}
            autoComplete="off"
          />
          <button type="submit">{t('editorial.search.submit', 'Search')}</button>
        </div>
      </form>

      {!query.trim() ? (
        <p className="editorial-search-hint">
          {t('editorial.search.startHint', 'Enter a term to start exploring.')}
        </p>
      ) : results.length === 0 ? (
        <p className="editorial-search-hint">
          {t('editorial.search.noResults', 'No matching articles found.')}
        </p>
      ) : (
        <section className="editorial-search-results" aria-live="polite">
          <p className="editorial-result-count">
            {t('editorial.search.resultCount', `${results.length} articles found`, {
              count: results.length,
            })}
          </p>
          {results.map(({ document }) => (
            <article key={document.route} className="editorial-search-result">
              <div className="editorial-post-card-meta">
                <time dateTime={document.updateDate}>{formatDate(document.updateDate)}</time>
              </div>
              <h2>
                <a href={normalizeHrefInRuntime(`${base}${document.route}`)}>
                  {highlight(document.title, query.trim())}
                </a>
              </h2>
              {(document.description || document.excerpt) && (
                <p>{highlight(document.description || document.excerpt || '', query.trim())}</p>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default SearchLayout;
