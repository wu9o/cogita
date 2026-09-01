import type { Post } from '@cogita/ui';
import { normalizeHrefInRuntime, normalizeImagePath, usePageData } from '@rspress/runtime';
import { t } from '../i18n';
import { formatDate, getBase } from '../utils';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

function PostTags({ tags = [] }: { tags?: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="lucid-post-tags" aria-label={t('lucid.article.tags', 'Article topics')}>
      {tags.slice(0, 4).map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ul>
  );
}

/** 统一渲染 Lucid 主题中的文章卡片，避免首页和列表页风格分裂。 */
export function PostCard({ post, featured = false }: PostCardProps) {
  const base = getBase(usePageData());
  const postHref = normalizeHrefInRuntime(`${base}${post.route}`);

  return (
    <article className={`lucid-post-card${featured ? ' lucid-post-card-featured' : ''}`}>
      {post.image && (
        <a
          className="lucid-post-card-cover"
          href={postHref}
          aria-label={t('lucid.post.read', `Read ${post.title}`, { title: post.title })}
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
      <div className="lucid-post-card-body">
        <div className="lucid-post-card-meta">
          <time dateTime={post.updateDate}>{formatDate(post.updateDate)}</time>
          {post.categories?.[0] && <span>{post.categories[0]}</span>}
        </div>
        <h2 className="lucid-post-card-title">
          <a href={postHref}>{post.title}</a>
        </h2>
        {post.description && <p className="lucid-post-card-description">{post.description}</p>}
        <PostTags tags={post.tags} />
      </div>
    </article>
  );
}

export function PostCardList({ posts }: { posts: Post[] }) {
  return (
    <div className="lucid-post-card-list">
      {posts.map((post) => (
        <PostCard key={post.route} post={post} />
      ))}
    </div>
  );
}
