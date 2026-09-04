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
        <h1>{t('knowledge.search.title', 'Find the next relevant idea.')}</h1>
        <p>
          {t(
            'knowledge.search.description',
            'Search articles, documents, tags, and full-text content.'
          )}
        </p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('knowledge.search.placeholder', 'Enter at least {{count}} characters', {
            count: searchConfig.minQueryLength,
          })}
          aria-label={t('knowledge.search.ariaLabel', 'Search knowledge base')}
        />
      </header>

      <section className="knowledge-search-results" aria-live="polite">
        {!meetsMinimumLength && (
          <p className="knowledge-empty">
            {normalizedQuery
              ? t('knowledge.search.minLength', 'Enter at least {{count}} characters.', {
                  count: searchConfig.minQueryLength,
                })
              : t('knowledge.search.empty', 'Enter a keyword to explore.')}
          </p>
        )}
        {meetsMinimumLength && results.length === 0 && (
          <p className="knowledge-empty">
            {t('knowledge.search.noResults', 'No matching content found.')}
          </p>
        )}
        {results.map(({ entry }) => (
          <article key={entry.route} className="knowledge-search-result">
            <span>
              {entry.kind === 'document'
                ? t('knowledge.search.document', 'Document')
                : t('knowledge.search.post', 'Article')}
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
