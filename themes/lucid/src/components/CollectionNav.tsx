import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import { getCollectionByPostRoute } from 'virtual-collections-data';
import { getBase, getPageRoute } from '../utils';

/**
 * 文章详情页合集导航组件
 *
 * 通过 globalUIComponents 注册到所有页面，仅在文章属于某个合集时渲染：
 * - 合集归属提示（"本文是《合集标题》系列的第 N 篇"）
 * - 上一篇/下一篇导航链接
 * - 阅读进度指示器（第 N/M 篇）
 */
export default function CollectionNav() {
  const pageData = usePageData();
  const base = getBase(pageData);

  const articleRoute = getPageRoute(pageData, base).replace(/^\/+/, '');

  // 查找文章所属合集
  const collection = getCollectionByPostRoute(articleRoute);
  if (!collection) return null;

  // 找当前文章在合集中的位置
  const currentIndex = collection.posts.findIndex((p) => p.route === articleRoute);
  if (currentIndex === -1) return null;

  const prevPost = currentIndex > 0 ? collection.posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < collection.posts.length - 1 ? collection.posts[currentIndex + 1] : null;

  const collectionsHref = normalizeHrefInRuntime(`${base}/collections`);
  const collectionHref = normalizeHrefInRuntime(`${base}${collection.route}`);

  return (
    <div className="article-collection-nav">
      <div className="collection-nav-info">
        <a href={collectionHref} className="collection-nav-link">
          {collection.title}
        </a>
        <span className="collection-nav-progress">
          第 {currentIndex + 1} / {collection.count} 篇
        </span>
      </div>
      {(prevPost || nextPost) && (
        <nav className="collection-nav-buttons">
          {prevPost ? (
            <a
              href={normalizeHrefInRuntime(`${base}${prevPost.route}`)}
              className="collection-nav-btn collection-nav-prev"
            >
              <span className="collection-nav-btn-label">上一篇</span>
              <span className="collection-nav-btn-title">
                {prevPost.collectionTitle || prevPost.title}
              </span>
            </a>
          ) : (
            <span className="collection-nav-btn collection-nav-btn-placeholder" />
          )}
          {nextPost ? (
            <a
              href={normalizeHrefInRuntime(`${base}${nextPost.route}`)}
              className="collection-nav-btn collection-nav-next"
            >
              <span className="collection-nav-btn-label">下一篇</span>
              <span className="collection-nav-btn-title">
                {nextPost.collectionTitle || nextPost.title}
              </span>
            </a>
          ) : (
            <span className="collection-nav-btn collection-nav-btn-placeholder" />
          )}
        </nav>
      )}
      <div className="collection-nav-breadcrumb">
        <a href={collectionsHref}>全部合集</a>
        <span className="separator">/</span>
        <a href={collectionHref}>{collection.title}</a>
      </div>
    </div>
  );
}
