import { normalizeHrefInRuntime } from '@rspress/runtime';
import { Link } from '@rspress/theme-default';
import type React from 'react';
import styles from './index.module.css';

export interface TagListProps {
  /**
   * 标签名称数组
   */
  tags: string[];
  /**
   * 显示变体
   */
  variant?: 'default' | 'compact' | 'badge';
  /**
   * 标签链接前缀
   */
  linkPrefix?: string;
  /**
   * 最大显示数量
   */
  limit?: number;
  /**
   * 自定义CSS类名
   */
  className?: string;
  /**
   * 点击回调函数
   */
  onTagClick?: (tag: string) => void;
}

/**
 * 生成标签 slug
 */
function generateTagSlug(tagName: string): string {
  return tagName
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 标签列表组件
 * 用于在文章中显示标签列表
 */
export const TagList: React.FC<TagListProps> = ({ 
  tags, 
  variant = 'default',
  linkPrefix = '/tags',
  limit,
  className = '',
  onTagClick
}) => {
  if (!tags?.length) return null;
  
  // 应用数量限制
  const displayTags = limit ? tags.slice(0, limit) : tags;
  const hasMore = limit && tags.length > limit;
  
  const handleTagClick = (tag: string) => {
    onTagClick?.(tag);
  };
  
  return (
    <div className={`${styles.tagList} ${styles[variant]} ${className}`}>
      <span className={styles.tagLabel}>标签:</span>
      {displayTags.map((tag) => (
        <Link
          key={tag}
          href={normalizeHrefInRuntime(`${linkPrefix}/${generateTagSlug(tag)}`)}
          className={styles.tag}
          onClick={() => handleTagClick(tag)}
        >
          #{tag}
        </Link>
      ))}
      {hasMore && (
        <span className={styles.moreIndicator}>
          +{tags.length - limit!} 更多
        </span>
      )}
    </div>
  );
};
