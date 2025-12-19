import { normalizeHrefInRuntime } from '@rspress/runtime';
// import { Link } from 'react-router-dom';
import { Link } from '@rspress/theme-default';
import type React from 'react';
import type { Post } from '../../types';
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
}

const DefaultPostItem: React.FC<{ post: Post; showTags?: boolean }> = ({ post, showTags = true }) => (
  <article key={post.url} className={styles.postItem}>
    <Link href={normalizeHrefInRuntime(post.route)}>
      <h2 className={styles.title}>{post.title}</h2>
      <time dateTime={post.updateDate} className={styles.date}>
        {new Date(post.updateDate).toLocaleDateString('zh-CN')}
      </time>
    </Link>

    {post.description && (
      <p className={styles.description}>{post.description}</p>
    )}

    {showTags && post.tags && post.tags.length > 0 && (
      <div className={styles.postMeta}>
        <TagList 
          tags={post.tags} 
          variant="compact"
          limit={5}
        />
      </div>
    )}
  </article>
);

export const PostList: React.FC<PostListProps> = ({ posts, renderItem, showTags = true }) => {
  return (
    <div className={styles.postListContainer}>
      {posts.map((post) =>
        renderItem ? renderItem(post) : <DefaultPostItem key={post.url} post={post} showTags={showTags} />
      )}
    </div>
  );
};
