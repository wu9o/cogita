import { normalizeHrefInRuntime } from '@rspress/runtime';
import type React from 'react';
import { t } from 'virtual-cogita-i18n-text';
import styles from './index.module.css';

// generateTagSlug 本地实现（与 @cogita/shared 保持一致逻辑）
// 不 import shared：rspress 客户端 bundle 无法 resolve @cogita/shared（shared 原为纯类型包，
// 浏览器端首次 import 运行时代码会致页面空白）。shared 版本供 Node 端 plugin-tags 使用。
function generateTagSlug(tagName: string): string {
  return (
    tagName
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || `tag-${Math.abs(hashCode(tagName))}`
  );
}
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & hash;
  }
  return hash;
}

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
 * 标签列表组件
 * 用于在文章中显示标签列表
 * slug 生成统一使用 @cogita/shared 的 generateTagSlug，保证与 tags 插件一致
 */
export const TagList: React.FC<TagListProps> = ({
  tags,
  variant = 'default',
  linkPrefix = '/tags',
  limit,
  className = '',
  onTagClick,
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
      <span className={styles.tagLabel}>{t('ui.tagList.label', 'Topics:')}</span>
      {displayTags.map((tag) => (
        <a
          key={tag}
          href={normalizeHrefInRuntime(`${linkPrefix}/${generateTagSlug(tag)}`)}
          className={styles.tag}
          onClick={() => handleTagClick(tag)}
        >
          #{tag}
        </a>
      ))}
      {hasMore && limit && (
        <span className={styles.moreIndicator}>
          {t('ui.tagList.more', `+${tags.length - limit} more`, { count: tags.length - limit })}
        </span>
      )}
    </div>
  );
};
