import { normalizeHrefInRuntime } from '@rspress/runtime';
// import { Link } from 'react-router-dom';
import { Link } from '@rspress/theme-default';
import type React from 'react';
import type { Post } from '../../types';
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
}

const DefaultPostItem: React.FC<{ post: Post }> = ({ post }) => (
  <article key={post.url} className={styles.postItem}>
    <Link href={normalizeHrefInRuntime(post.route)}>
      <h2 className={styles.title}>{post.title}</h2>
      <time dateTime={post.updateDate} className={styles.date}>
        {new Date(post.updateDate).toLocaleDateString()}
      </time>
    </Link>

    {/* {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>} */}
  </article>
);

export const PostList: React.FC<PostListProps> = ({ posts, renderItem }) => {
  return (
    <div className={styles.postListContainer}>
      {posts.map((post) =>
        renderItem ? renderItem(post) : <DefaultPostItem key={post.url} post={post} />
      )}
    </div>
  );
};
