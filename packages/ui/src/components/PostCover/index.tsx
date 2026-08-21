import { normalizeImagePath } from '@rspress/runtime';
import type React from 'react';
import styles from './index.module.css';

export interface PostCoverProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * 渲染文章封面，并兼容 Rspress 的 base 配置。
 */
export const PostCover: React.FC<PostCoverProps> = ({ src, alt, caption, width, height }) => (
  <figure className={styles.postCover}>
    <img
      className={styles.postCoverImage}
      src={normalizeImagePath(src)}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
    />
    {caption && <figcaption className={styles.postCoverCaption}>{caption}</figcaption>}
  </figure>
);
