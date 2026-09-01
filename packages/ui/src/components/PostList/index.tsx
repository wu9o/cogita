import { normalizeHrefInRuntime } from '@rspress/runtime';
import type React from 'react';
import { locale } from 'virtual-cogita-i18n-text';
import type { Post } from '../../types';
import { PostCover } from '../PostCover';
import { TagList } from '../TagList';
import styles from './index.module.css';

export interface PostListProps {
  /**
   * An array of post objects to display.
   */
  posts: Post[];
  /**
   * A custom render function for each post item.
   * If not provided, a default renderer will be used.
   */
  renderItem?: (post: Post) => React.ReactNode;
  /**
   * Whether to show tags in post items
   */
  showTags?: boolean;
  /** 是否在文章卡片中显示封面。 */
  showCover?: boolean;
}

const DefaultPostItem: React.FC<{ post: Post; showTags?: boolean; showCover?: boolean }> = ({
  post,
  showTags = true,
  showCover = false,
}) => (
  <article key={post.url} className={styles.postItem}>
    {showCover && post.image && (
      <PostCover
        src={post.image}
        alt={post.imageAlt || post.title}
        caption={post.imageCaption}
        width={post.imageWidth}
        height={post.imageHeight}
      />
    )}
    <a href={normalizeHrefInRuntime(post.route)}>
      <h2 className={styles.title}>{post.title}</h2>
      <time dateTime={post.updateDate} className={styles.date}>
        {new Date(post.updateDate).toLocaleDateString(locale)}
      </time>
    </a>

    {post.description && <p className={styles.description}>{post.description}</p>}

    {showTags && post.tags && post.tags.length > 0 && (
      <div className={styles.postMeta}>
        <TagList tags={post.tags} variant="compact" limit={5} />
      </div>
    )}
  </article>
);

export const PostList: React.FC<PostListProps> = ({
  posts,
  renderItem,
  showTags = true,
  showCover = false,
}) => {
  return (
    <div className={styles.postListContainer}>
      {posts.map((post) =>
        renderItem ? (
          renderItem(post)
        ) : (
          <DefaultPostItem key={post.url} post={post} showTags={showTags} showCover={showCover} />
        )
      )}
    </div>
  );
};
