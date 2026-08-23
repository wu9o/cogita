import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allCollections, getCollectionBySlug } from 'virtual-collections-data';
import { formatDate, getBase } from '../utils';

/** 合集索引和合集详情页面，突出系列阅读顺序。 */
const CollectionLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const rawSlug =
    pathname
      .split('/collections/')[1]
      ?.replace(/\.html$/, '')
      .replace(/\/$/, '') || '';
  const slug = decodeURIComponent(rawSlug);
  const collectionsHref = normalizeHrefInRuntime(`${base}/collections`);

  if (!slug) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Collections</p>
          <h1>文章合集</h1>
          <p>共 {allCollections.length} 个合集</p>
        </header>
        <div className="editorial-collection-grid">
          {allCollections.map((collection) => (
            <a key={collection.slug} href={normalizeHrefInRuntime(`${base}${collection.route}`)}>
              <strong>{collection.title}</strong>
              {collection.description && <span>{collection.description}</span>}
              <small>{collection.count} 篇文章</small>
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
        <a href={collectionsHref}>← 返回合集</a>
        <p className="editorial-empty">合集不存在。</p>
      </div>
    );
  }

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Collection</p>
        <h1>{collection.title}</h1>
        {collection.description && <p>{collection.description}</p>}
        <a href={collectionsHref}>返回合集索引</a>
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
