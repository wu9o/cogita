import { normalizeHrefInRuntime, normalizeImagePath, usePageData } from '@rspress/runtime';
import { t } from '../i18n';
import { type EditorialPost, formatDate, getBase } from '../utils';

interface PostCardProps {
  post: EditorialPost;
  featured?: boolean;
}

function PostTags({ tags = [] }: { tags?: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="editorial-post-tags" aria-label={t('editorial.article.tags', 'Article topics')}>
      {tags.slice(0, 4).map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ul>
  );
}

/** 统一渲染 Editorial 主题中的主推文章和普通文章卡片。 */
export function PostCard({ post, featured = false }: PostCardProps) {
  const base = getBase(usePageData());
  const postHref = normalizeHrefInRuntime(`${base}${post.route}`);

  return (
    <article className={`editorial-post-card${featured ? ' editorial-post-card-featured' : ''}`}>
      {post.image && (
        <a
          className="editorial-post-card-cover"
          href={postHref}
          aria-label={t('editorial.post.read', `Read ${post.title}`, { title: post.title })}
        >
          <img
            src={normalizeImagePath(post.image)}
            alt={post.imageAlt || post.title}
            loading={featured ? 'eager' : 'lazy'}
            width={post.imageWidth}
            height={post.imageHeight}
          />
        </a>
      )}
      <div className="editorial-post-card-body">
        <div className="editorial-post-card-meta">
          <time dateTime={post.updateDate}>{formatDate(post.updateDate)}</time>
          {post.categories?.[0] && <span>{post.categories[0]}</span>}
        </div>
        <h2 className="editorial-post-card-title">
          <a href={postHref}>{post.title}</a>
        </h2>
        {post.description && <p className="editorial-post-card-description">{post.description}</p>}
        <PostTags tags={post.tags} />
      </div>
    </article>
  );
}

export function PostCardList({ posts }: { posts: EditorialPost[] }) {
  return (
    <div className="editorial-post-card-list">
      {posts.map((post) => (
        <PostCard key={post.route} post={post} />
      ))}
    </div>
  );
}
