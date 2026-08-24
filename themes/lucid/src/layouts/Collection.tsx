import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allCollections, collectionsConfig, getCollectionBySlug } from 'virtual-collections-data';
import { formatDate, getBase, getCurrentRoute } from '../utils';

/**
 * 合集页面布局（索引页 + 详情页共用）
 * 消费 virtual-collections-data 虚拟模块，根据当前 URL 路径判断渲染哪种页面：
 * - /collections（无 slug）→ 合集索引页：所有合集卡片
 * - /collections/:slug → 合集详情页：有序文章列表 + 上一篇/下一篇导航
 */
const CollectionPageLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const collectionPrefix = collectionsConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const collectionsHref = normalizeHrefInRuntime(`${base}/${collectionPrefix}`);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const route = getCurrentRoute(pathname, base).replace(/^\/+/, '');
  const slug = route.startsWith(`${collectionPrefix}/`)
    ? route.slice(`${collectionPrefix}/`.length)
    : '';

  // 索引页：无 slug，展示所有合集
  if (!slug) {
    return (
      <div className="collection-page">
        <header className="collection-header">
          <h1 className="collection-title">合集</h1>
          <p className="collection-meta">共 {allCollections.length} 个合集</p>
        </header>
        <section className="collection-list-section">
          {allCollections.length === 0 ? (
            <p className="collection-empty">暂无合集</p>
          ) : (
            <div className="collection-cards">
              {allCollections.map((collection) => (
                <a
                  key={collection.slug}
                  href={normalizeHrefInRuntime(`${base}${collection.route}`)}
                  className="collection-card"
                >
                  <h3 className="collection-card-title">{collection.title}</h3>
                  {collection.description && (
                    <p className="collection-card-desc">{collection.description}</p>
                  )}
                  <p className="collection-card-meta">
                    {collection.count} 篇文章
                    {collection.updatedDate && ` · 更新于 ${formatDate(collection.updatedDate)}`}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // 详情页：按 slug 查找合集
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return (
      <div className="collection-page">
        <a href={collectionsHref} className="collection-back">
          ← 返回合集索引
        </a>
        <p className="collection-empty">合集不存在</p>
      </div>
    );
  }

  return (
    <div className="collection-page">
      <header className="collection-header">
        <a href={collectionsHref} className="collection-back">
          ← 返回合集索引
        </a>
        <h1 className="collection-title">{collection.title}</h1>
        {collection.description && (
          <p className="collection-description">{collection.description}</p>
        )}
        <p className="collection-meta">
          {collection.count} 篇文章 · 创建于 {formatDate(collection.createdDate)}
        </p>
      </header>

      <section className="collection-posts">
        <ol className="ordered-post-list">
          {collection.posts.map((post, index) => (
            <li key={post.route} className="ordered-post-item">
              <span className="post-order">{index + 1}</span>
              <div className="post-info">
                <a href={normalizeHrefInRuntime(`${base}${post.route}`)} className="post-link">
                  {post.collectionTitle || post.title}
                </a>
                <time className="post-date">{formatDate(post.createDate)}</time>
                {post.description && <p className="post-desc">{post.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default CollectionPageLayout;
