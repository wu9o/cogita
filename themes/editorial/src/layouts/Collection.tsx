import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allCollections, collectionsConfig, getCollectionBySlug } from 'virtual-collections-data';
import { t } from '../i18n';
import { formatDate, getBase, getPageRoute } from '../utils';

/** 合集索引和合集详情页面，突出系列阅读顺序。 */
const CollectionLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  const collectionPrefix = collectionsConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const slug = route.startsWith(`${collectionPrefix}/`)
    ? route.slice(`${collectionPrefix}/`.length)
    : '';
  const collectionsHref = normalizeHrefInRuntime(`${base}/${collectionPrefix}`);

  if (!slug) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Collections</p>
          <h1>{t('editorial.collection.title', 'Article collections')}</h1>
          <p>
            {t('editorial.collection.total', `${allCollections.length} collections`, {
              count: allCollections.length,
            })}
          </p>
        </header>
        <div className="editorial-collection-grid">
          {allCollections.map((collection) => (
            <a key={collection.slug} href={normalizeHrefInRuntime(`${base}${collection.route}`)}>
              <strong>{collection.title}</strong>
              {collection.description && <span>{collection.description}</span>}
              <small>
                {t('editorial.collection.count', `${collection.count} posts`, {
                  count: collection.count,
                })}
              </small>
            </a>
          ))}
        </div>
      </div>
    );
  }

  const collection = getCollectionBySlug(slug);
  if (!collection) {
    return (
      <div className="editorial-index-page">
        <a href={collectionsHref}>← {t('editorial.collection.back', 'Back to collections')}</a>
        <p className="editorial-empty">
          {t('editorial.collection.notFound', 'Collection not found.')}
        </p>
      </div>
    );
  }

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Collection</p>
        <h1>{collection.title}</h1>
        {collection.description && <p>{collection.description}</p>}
        <a href={collectionsHref}>{t('editorial.collection.index', 'Back to collection index')}</a>
      </header>
      <ol className="editorial-ordered-posts">
        {collection.posts.map((post, index) => (
          <li key={post.route}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <a href={normalizeHrefInRuntime(`${base}${post.route}`)}>{post.title}</a>
              <time dateTime={post.createDate}>{formatDate(post.createDate)}</time>
              {post.description && <p>{post.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default CollectionLayout;
