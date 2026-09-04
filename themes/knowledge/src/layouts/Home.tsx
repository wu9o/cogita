import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { useMemo } from 'react';
import { t } from 'virtual-cogita-i18n-text';
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
          <p className="knowledge-lead">{copy.lead}</p>
          <nav
            className="knowledge-actions"
            aria-label={t('knowledge.home.navigation', 'Knowledge base navigation')}
          >
            <a href={normalizeHrefInRuntime(getHref(base, '/search'))}>
              {t('knowledge.home.search', 'Search knowledge')}
            </a>
            <a href={normalizeHrefInRuntime(getHref(base, `/${tagsConfig.routePrefix}`))}>
              {t('knowledge.home.tags', 'Browse tags')}
            </a>
          </nav>
        </div>
        <div
          className="knowledge-stats"
          aria-label={t('knowledge.home.stats', 'Knowledge base statistics')}
        >
          <div>
            <strong>{searchDocuments.length}</strong>
            <span>{t('knowledge.home.contentEntries', 'Content entries')}</span>
          </div>
          <div>
            <strong>{allTags.length}</strong>
            <span>{t('knowledge.home.topicTags', 'Topic tags')}</span>
          </div>
          <div>
            <strong>{relationCount}</strong>
            <span>{t('knowledge.home.contentLinks', 'Content links')}</span>
          </div>
        </div>
      </section>

      <div className="knowledge-grid">
        <section className="knowledge-recent" aria-labelledby="knowledge-recent-title">
          <div className="knowledge-section-heading">
            <div>
              <p className="knowledge-section-label">
                {t('knowledge.home.recentLabel', 'Recently updated')}
              </p>
              <h2 id="knowledge-recent-title">
                {t('knowledge.home.recentTitle', 'Recently updated')}
              </h2>
            </div>
            <a href={normalizeHrefInRuntime(getHref(base, '/search'))}>
              {t('knowledge.home.viewAll', 'View all →')}
            </a>
          </div>
          <div className="knowledge-entry-list">
            {recentEntries.map((entry) => (
              <a
                key={entry.route}
                href={normalizeHrefInRuntime(getHref(base, entry.route))}
                className="knowledge-entry-card"
              >
                <span className="knowledge-entry-kind">
                  {entry.kind === 'document'
                    ? t('knowledge.home.document', 'Document')
                    : t('knowledge.home.post', 'Article')}
                </span>
                <strong>{entry.title}</strong>
                <p>
                  {entry.description ||
                    entry.excerpt ||
                    t('knowledge.home.openEntry', 'Open entry to continue reading.')}
                </p>
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
                <h2>{t('knowledge.home.explore', 'Explore by topic')}</h2>
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
            <p className="knowledge-section-label">
              {t('knowledge.home.findAnything', 'Find anything')}
            </p>
            <h2>{t('knowledge.home.findStart', 'Start with one keyword.')}</h2>
            <p>
              {t('knowledge.home.searchCount', '{{count}} content entries indexed.', {
                count: searchDocuments.length,
              })}
            </p>
            <a href={normalizeHrefInRuntime(getHref(base, `/${searchConfig.routePrefix}`))}>
              {t('knowledge.home.openSearch', 'Open search →')}
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default HomeLayout;
