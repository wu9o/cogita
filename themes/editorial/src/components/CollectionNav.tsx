import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import { getCollectionByPostRoute } from 'virtual-collections-data';
import { t } from '../i18n';
import { getBase, getPageRoute } from '../utils';

/** 在合集文章底部提供系列信息和前后文章导航。 */
export default function CollectionNav() {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base).replace(/^\//, '');
  const collection = getCollectionByPostRoute(route);
  if (!collection) return null;

  const currentIndex = collection.posts.findIndex((post) => post.route === route);
  if (currentIndex < 0) return null;

  const previous = collection.posts[currentIndex - 1];
  const next = collection.posts[currentIndex + 1];

  return (
    <section
      className="editorial-collection-nav"
      aria-label={t('editorial.collection.navigation', 'Collection navigation')}
    >
      <div>
        <a
          href={normalizeHrefInRuntime(`${base}${collection.route}`)}
          className="editorial-collection-name"
        >
          {collection.title}
        </a>
        <span>
          {t('editorial.collection.progress', `${currentIndex + 1} of ${collection.count}`, {
            current: currentIndex + 1,
            total: collection.count,
          })}
        </span>
      </div>
      <nav className="editorial-collection-links">
        {previous ? (
          <a href={normalizeHrefInRuntime(`${base}${previous.route}`)}>← {previous.title}</a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={normalizeHrefInRuntime(`${base}${next.route}`)}>{next.title} →</a>
        ) : (
          <span />
        )}
      </nav>
    </section>
  );
}
