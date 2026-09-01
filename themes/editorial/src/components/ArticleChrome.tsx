import { normalizeImagePath, usePageData } from '@rspress/runtime';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { allPosts } from 'virtual-posts-data';
import { getReadingStats } from 'virtual-reading-progress-data';
import { t } from '../i18n';
import {
  type EditorialPost,
  addPostCovers,
  formatDate,
  getBase,
  getEditorialConfig,
  getPageRoute,
} from '../utils';
import { PostCardList } from './PostCard';

interface MountPoints {
  header: HTMLElement | null;
  related: HTMLElement | null;
}

function getSharedItems(left: string[] = [], right: string[] = []): string[] {
  const rightItems = new Set(right);
  return left.filter((item) => rightItems.has(item));
}

function getRelatedPosts(posts: EditorialPost[], current: EditorialPost, limit: number) {
  return posts
    .filter((post) => post.route !== current.route)
    .map((post) => {
      const sharedTags = getSharedItems(current.tags, post.tags);
      const sharedCategories = getSharedItems(current.categories, post.categories);
      return {
        post,
        score: sharedTags.length * 2 + sharedCategories.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.post.updateDate).getTime() - new Date(left.post.updateDate).getTime()
    )
    .slice(0, limit)
    .map((item) => item.post);
}

function ArticleHeader({ post }: { post: EditorialPost }) {
  const stats = getReadingStats(post.route);

  return (
    <header className="editorial-article-header">
      <div className="editorial-article-meta">
        <span>Article</span>
        <time dateTime={post.updateDate}>{formatDate(post.updateDate)}</time>
        {post.author && <span>{post.author}</span>}
        {stats && (
          <span>
            {t('editorial.article.readingTime', `${stats.readingTimeMinutes} min read`, {
              minutes: stats.readingTimeMinutes,
            })}
          </span>
        )}
      </div>
      {post.image && (
        <figure className="editorial-article-cover">
          <img
            src={normalizeImagePath(post.image)}
            alt={post.imageAlt || post.title}
            width={post.imageWidth}
            height={post.imageHeight}
          />
          {post.imageCaption && <figcaption>{post.imageCaption}</figcaption>}
        </figure>
      )}
      {post.tags && post.tags.length > 0 && (
        <ul
          className="editorial-article-tags"
          aria-label={t('editorial.article.tags', 'Article topics')}
        >
          {post.tags.slice(0, 6).map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      )}
    </header>
  );
}

function RelatedPosts({ posts }: { posts: EditorialPost[] }) {
  return (
    <section className="editorial-related-posts" aria-labelledby="editorial-related-title">
      <div className="editorial-section-heading">
        <div>
          <p className="editorial-eyebrow">Continue reading</p>
          <h2 id="editorial-related-title">
            {t('editorial.article.continue', 'Continue reading')}
          </h2>
        </div>
      </div>
      <PostCardList posts={posts} />
    </section>
  );
}

/** 为 Rspress 文章详情页补充主题化元信息和相关推荐区域。 */
export default function ArticleChrome() {
  const pageData = usePageData();
  const route = getPageRoute(pageData, getBase(pageData));
  const config = getEditorialConfig(pageData);
  const posts = useMemo(() => addPostCovers(allPosts), []);
  const currentPost = posts.find((post) => post.route === route);
  const relatedPosts = useMemo(
    () =>
      currentPost && config.relatedPosts.enabled
        ? getRelatedPosts(posts, currentPost, config.relatedPosts.limit)
        : [],
    [config.relatedPosts.enabled, config.relatedPosts.limit, currentPost, posts]
  );
  const [mountPoints, setMountPoints] = useState<MountPoints>({ header: null, related: null });

  useEffect(() => {
    if (!currentPost || typeof document === 'undefined') {
      setMountPoints({ header: null, related: null });
      return;
    }

    const article = document.querySelector<HTMLElement>('.rspress-doc');
    if (!article) return;

    const headerMount = document.createElement('div');
    headerMount.className = 'editorial-article-header-mount';
    article.prepend(headerMount);

    const footer = document.querySelector<HTMLElement>('.rspress-doc-footer');
    const relatedMount = relatedPosts.length > 0 ? document.createElement('div') : null;
    if (relatedMount && footer) {
      relatedMount.className = 'editorial-related-posts-mount';
      footer.prepend(relatedMount);
    }

    setMountPoints({ header: headerMount, related: relatedMount && footer ? relatedMount : null });

    return () => {
      headerMount.remove();
      relatedMount?.remove();
      setMountPoints({ header: null, related: null });
    };
  }, [currentPost, relatedPosts.length]);

  return (
    <>
      {mountPoints.header && currentPost
        ? createPortal(<ArticleHeader post={currentPost} />, mountPoints.header)
        : null}
      {mountPoints.related && relatedPosts.length > 0
        ? createPortal(<RelatedPosts posts={relatedPosts} />, mountPoints.related)
        : null}
    </>
  );
}
