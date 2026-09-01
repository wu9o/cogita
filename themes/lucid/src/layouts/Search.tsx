import type { SearchAnalyticsDetail } from '@cogita/plugin-search';
import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { searchConfig, searchDocuments, searchIndexHash } from 'virtual-search-data';
import { t } from '../i18n';
import { formatDate, getBase } from '../utils';

interface SearchResult {
  score: number;
  document: (typeof searchDocuments)[number];
}

interface SearchAnalyticsWindow extends Window {
  dataLayer?: {
    push(payload: SearchAnalyticsDetail): number;
  };
}

function getRuntimeHref(base: string, route: string): string {
  return normalizeHrefInRuntime(`${base}${route}`);
}

/** 判断搜索文本是否命中，英文按词边界匹配，中文保留连续字符匹配。 */
function matchesSearchTerm(value: string, query: string): boolean {
  const normalizedValue = value.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();

  if (!normalizedValue || !normalizedQuery) return false;
  if (/\p{Script=Han}/u.test(normalizedQuery)) {
    return normalizedValue.includes(normalizedQuery);
  }

  const queryTokens = normalizedQuery.match(/[\p{L}\p{N}]+/gu) || [];
  const valueTokens = normalizedValue.match(/[\p{L}\p{N}]+/gu) || [];

  if (queryTokens.length === 0) return normalizedValue.includes(normalizedQuery);
  if (queryTokens.length === 1) {
    return valueTokens.some((token) => token.startsWith(queryTokens[0]));
  }

  return valueTokens.some((_, index) =>
    queryTokens.every((token, offset) => valueTokens[index + offset]?.startsWith(token))
  );
}

/** 转义正则表达式中的特殊字符，避免用户输入破坏高亮规则。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 构造与搜索规则一致的高亮匹配器。 */
function createHighlightPattern(query: string): RegExp | null {
  if (/\p{Script=Han}/u.test(query)) {
    return new RegExp(`(${escapeRegExp(query)})`, 'giu');
  }

  const tokens = query.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  if (tokens.length === 0) return null;

  const uniqueTokens = [...new Set(tokens)].sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\p{L}\\p{N}])(${uniqueTokens.map(escapeRegExp).join('|')})`, 'giu');
}

/** 在搜索结果文本中标记命中的关键词，使用 mark 避免拼接不安全的 HTML。 */
function highlightSearchText(value: string, query: string): React.ReactNode {
  const pattern = createHighlightPattern(query);
  if (!pattern) return value;

  const matches = [...value.matchAll(pattern)];
  if (matches.length === 0) return value;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(value.slice(cursor, start));
    parts.push(<mark key={`${start}-${match[0]}`}>{match[0]}</mark>);
    cursor = start + match[0].length;
  }

  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts;
}

/** 从正文命中位置截取搜索上下文，避免结果卡片直接展示整篇文章。 */
function getContentSearchContext(content: string, query: string): string {
  const pattern = createHighlightPattern(query);
  const match = pattern ? pattern.exec(content) : null;
  if (!match || match.index === undefined) return content.slice(0, 180);

  const contextRadius = 90;
  const start = Math.max(0, match.index - contextRadius);
  const end = Math.min(content.length, match.index + match[0].length + contextRadius);
  return `${start > 0 ? '…' : ''}${content.slice(start, end)}${end < content.length ? '…' : ''}`;
}

/** 选择搜索结果摘要，正文命中时优先展示关键词附近的上下文。 */
function getSearchResultSummary(document: (typeof searchDocuments)[number], query: string): string {
  const summary = document.description || document.excerpt || '';
  if (document.content && matchesSearchTerm(document.content, query)) {
    return getContentSearchContext(document.content, query);
  }
  return summary;
}

/** 从搜索文档中提取去重后的筛选项。 */
function getFacetOptions(field: 'tags' | 'categories'): string[] {
  return [
    ...new Set(searchDocuments.flatMap((document) => document[field] || []).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/** 从当前地址读取搜索状态，保证复制搜索链接后可以恢复结果。 */
function getSearchStateFromUrl(): { query: string; tag: string; category: string } {
  if (typeof window === 'undefined') return { query: '', tag: '', category: '' };

  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') || '',
    tag: params.get('tag') || '',
    category: params.get('category') || '',
  };
}

function scoreDocument(document: (typeof searchDocuments)[number], query: string): number {
  const normalizedQuery = query.toLocaleLowerCase();
  const title = document.title.toLocaleLowerCase();
  const tags = (document.tags || []).join(' ').toLocaleLowerCase();
  const categories = (document.categories || []).join(' ').toLocaleLowerCase();
  const metadata = [document.description, document.excerpt, document.content]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();

  if (title === normalizedQuery) return 100;
  if (title.startsWith(normalizedQuery)) return 80;
  if (matchesSearchTerm(title, normalizedQuery)) return 60;
  if (matchesSearchTerm(tags, normalizedQuery)) return 45;
  if (matchesSearchTerm(categories, normalizedQuery)) return 35;
  if (matchesSearchTerm(metadata, normalizedQuery)) return 20;
  return 0;
}

/** 搜索页面布局，使用构建期生成的文章索引执行轻量本地搜索。 */
const SearchLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [urlStateInitialized, setUrlStateInitialized] = useState(false);
  const trimmedQuery = query.trim();
  const tagOptions = useMemo(() => getFacetOptions('tags'), []);
  const categoryOptions = useMemo(() => getFacetOptions('categories'), []);
  const hasFilters = Boolean(selectedTag || selectedCategory);
  const hasValidQuery = trimmedQuery.length >= searchConfig.minQueryLength;

  useEffect(() => {
    const urlState = getSearchStateFromUrl();
    setQuery(urlState.query);
    setSelectedTag(urlState.tag);
    setSelectedCategory(urlState.category);
    setUrlStateInitialized(true);
  }, []);

  useEffect(() => {
    if (!urlStateInitialized || typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (trimmedQuery) params.set('q', trimmedQuery);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedCategory) params.set('category', selectedCategory);

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [selectedCategory, selectedTag, trimmedQuery, urlStateInitialized]);

  const results = useMemo<SearchResult[]>(() => {
    if (!hasValidQuery && !hasFilters) return [];

    const filteredDocuments = searchDocuments.filter((document) => {
      if (selectedTag && !(document.tags || []).includes(selectedTag)) return false;
      if (selectedCategory && !(document.categories || []).includes(selectedCategory)) return false;
      return true;
    });

    if (!hasValidQuery) {
      return filteredDocuments
        .map((document) => ({ document, score: 0 }))
        .sort(
          (a, b) =>
            b.document.updateDate.localeCompare(a.document.updateDate) ||
            a.document.title.localeCompare(b.document.title, 'zh-CN')
        )
        .slice(0, searchConfig.maxResults);
    }

    return filteredDocuments
      .map((document) => ({ document, score: scoreDocument(document, trimmedQuery) }))
      .filter((result) => result.score > 0)
      .sort(
        (a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'zh-CN')
      )
      .slice(0, searchConfig.maxResults);
  }, [hasFilters, hasValidQuery, selectedCategory, selectedTag, trimmedQuery]);

  useEffect(() => {
    if (
      !urlStateInitialized ||
      !searchConfig.analytics.enabled ||
      (!hasValidQuery && !hasFilters) ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const payload: SearchAnalyticsDetail = {
        event: searchConfig.analytics.eventName,
        resultCount: results.length,
        queryLength: trimmedQuery.length,
        indexHash: searchIndexHash,
      };

      if (searchConfig.analytics.includeQuery && trimmedQuery) {
        payload.query = trimmedQuery;
      }
      if (searchConfig.analytics.includeFilters && (selectedTag || selectedCategory)) {
        payload.filters = {
          ...(selectedTag ? { tag: selectedTag } : {}),
          ...(selectedCategory ? { category: selectedCategory } : {}),
        };
      }

      window.dispatchEvent(new CustomEvent(searchConfig.analytics.eventName, { detail: payload }));
      (window as SearchAnalyticsWindow).dataLayer?.push(payload);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    hasFilters,
    hasValidQuery,
    results.length,
    selectedCategory,
    selectedTag,
    trimmedQuery,
    urlStateInitialized,
  ]);

  return (
    <div className="search-page">
      <header className="search-header">
        <div>
          <p className="blog-list-eyebrow">{t('lucid.search.eyebrow', 'Explore')}</p>
          <h1 className="blog-list-title">{t('lucid.search.title', 'Search articles')}</h1>
          <p className="blog-list-meta">
            {t('lucid.search.total', `${searchDocuments.length} searchable posts`, {
              count: searchDocuments.length,
            })}
          </p>
        </div>
        <a href={getRuntimeHref(base, '/')}>{t('lucid.search.home', 'Back to home')}</a>
      </header>

      <label className="search-input-label" htmlFor="cogita-search-input">
        {t('lucid.search.inputLabel', 'Search term')}
      </label>
      <div className="search-input-row">
        <input
          id="cogita-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(
            'lucid.search.placeholder',
            'Search titles, summaries, text, topics, or categories'
          )}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}>
            {t('lucid.search.clear', 'Clear')}
          </button>
        )}
      </div>

      <div className="search-filter-row" aria-label={t('lucid.search.filters', 'Search filters')}>
        <label>
          {t('lucid.search.topic', 'Topic')}
          <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
            <option value="">{t('lucid.search.allTopics', 'All topics')}</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('lucid.search.category', 'Category')}
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">{t('lucid.search.allCategories', 'All categories')}</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            className="search-filter-clear"
            type="button"
            onClick={() => {
              setSelectedTag('');
              setSelectedCategory('');
            }}
          >
            {t('lucid.search.clearFilters', 'Clear filters')}
          </button>
        )}
      </div>

      <div className="search-results" aria-live="polite">
        {!trimmedQuery && !hasFilters ? (
          <p className="search-empty">
            {t(
              'lucid.search.minLength',
              `Enter at least ${searchConfig.minQueryLength} characters to search.`,
              { count: searchConfig.minQueryLength }
            )}
          </p>
        ) : trimmedQuery && !hasValidQuery ? (
          <p className="search-empty">
            {t(
              'lucid.search.minLength',
              `Enter at least ${searchConfig.minQueryLength} characters to search.`,
              { count: searchConfig.minQueryLength }
            )}
          </p>
        ) : results.length === 0 ? (
          <p className="search-empty">
            {t('lucid.search.noResults', 'No matching articles found.')}
          </p>
        ) : (
          <>
            <p className="search-result-count">
              {t('lucid.search.resultCount', `${results.length} articles found`, {
                count: results.length,
              })}
            </p>
            {results.map(({ document }) => {
              const summary = getSearchResultSummary(document, trimmedQuery);
              return (
                <article key={document.id} className="search-result-item">
                  <a href={getRuntimeHref(base, document.route)}>
                    <h2>{highlightSearchText(document.title, trimmedQuery)}</h2>
                  </a>
                  <time dateTime={document.updateDate}>{formatDate(document.updateDate)}</time>
                  {summary && <p>{highlightSearchText(summary, trimmedQuery)}</p>}
                  {document.tags && document.tags.length > 0 && (
                    <div className="search-result-tags">
                      {document.tags.map((tag) => (
                        <span key={tag}>#{highlightSearchText(tag, trimmedQuery)}</span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchLayout;
