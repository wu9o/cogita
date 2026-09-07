import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { t } from 'virtual-cogita-i18n-text';
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
          <p className="knowledge-eyebrow">
            {copy.title} · {t('knowledge.tag.eyebrow', 'TOPICS')}
          </p>
          <h1>{t('knowledge.tag.title', 'Explore by topic')}</h1>
          <p>
            {t(
              'knowledge.tag.description',
              'Tags gather scattered articles and documents into reusable knowledge entry points.'
            )}
          </p>
        </header>
        <div className="knowledge-all-tags">
          {allTags.map((item) => (
            <a key={item.slug} href={normalizeHrefInRuntime(getHref(base, item.route))}>
              <strong>{item.name}</strong>
              <span>
                {t('knowledge.tag.contentCount', '{{count}} content items', { count: item.count })}
              </span>
            </a>
          ))}
        </div>
      </main>
    );
  }

  if (!tag) {
    return (
      <main className="knowledge-tag-page">
        <a href={normalizeHrefInRuntime(getHref(base, `/${prefix}`))}>
          {t('knowledge.tag.back', '← Back to all topics')}
        </a>
        <h1>{t('knowledge.tag.notFound', 'Topic not found')}</h1>
      </main>
    );
  }

  const relatedTags = getRelatedTags(tag.name, 8);
  return (
    <main className="knowledge-tag-page">
      <header className="knowledge-page-header">
        <a href={normalizeHrefInRuntime(getHref(base, `/${prefix}`))}>
          {t('knowledge.tag.back', '← Back to all topics')}
        </a>
        <p className="knowledge-eyebrow">{t('knowledge.tag.topic', 'TOPIC')}</p>
        <h1>#{tag.name}</h1>
        <p>
          {t('knowledge.tag.around', '{{count}} content items revolve around this topic.', {
            count: tag.count,
          })}
        </p>
      </header>
      <div className="knowledge-tag-entries">
        {tag.posts.map((entry) => (
          <a key={entry.route} href={normalizeHrefInRuntime(getHref(base, entry.route))}>
            <strong>{entry.title}</strong>
            <span>
              {entry.description || t('knowledge.tag.open', 'Open entry to continue reading.')}
            </span>
          </a>
        ))}
      </div>
      {relatedTags.length > 0 && (
        <section className="knowledge-related-tags">
          <h2>{t('knowledge.tag.related', 'Related topics')}</h2>
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
