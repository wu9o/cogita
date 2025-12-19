import { normalizeHrefInRuntime } from '@rspress/runtime';
import { Link } from '@rspress/theme-default';
import type React from 'react';
import styles from './index.module.css';

// 避免循环依赖，直接定义类型
interface TagData {
  name: string;
  slug: string;
  count: number;
  route: string;
}

export interface TagCloudProps {
  /**
   * 标签数据数组
   */
  tags: TagData[];
  /**
   * 标签云配置
   */
  config?: {
    minFontSize?: number;
    maxFontSize?: number;
    minOpacity?: number;
    maxOpacity?: number;
    limit?: number;
  };
  /**
   * 自定义CSS类名
   */
  className?: string;
  /**
   * 点击回调函数
   */
  onTagClick?: (tag: TagData) => void;
}

/**
 * 计算标签权重（用于视觉展示）
 */
function calculateTagWeight(tag: TagData, tags: TagData[]): number {
  if (tags.length <= 1) return 1;
  
  const minCount = Math.min(...tags.map(t => t.count));
  const maxCount = Math.max(...tags.map(t => t.count));
  
  if (minCount === maxCount) return 1;
  
  return (tag.count - minCount) / (maxCount - minCount);
}

/**
 * 标签云组件
 * 用于可视化展示标签的热度和分布
 */
export const TagCloud: React.FC<TagCloudProps> = ({ 
  tags, 
  config = {},
  className = '',
  onTagClick
}) => {
  const {
    minFontSize = 12,
    maxFontSize = 24,
    minOpacity = 0.5,
    maxOpacity = 1.0,
    limit = 50,
  } = config;
  
  // 限制显示的标签数量
  const displayTags = tags.slice(0, limit);
  
  // 计算标签样式
  const getTagStyle = (tag: TagData) => {
    const weight = calculateTagWeight(tag, tags);
    const fontSize = minFontSize + (maxFontSize - minFontSize) * weight;
    const opacity = minOpacity + (maxOpacity - minOpacity) * weight;
    
    return {
      fontSize: `${fontSize}px`,
      opacity,
    };
  };
  
  const handleTagClick = (tag: TagData) => {
    onTagClick?.(tag);
  };
  
  if (displayTags.length === 0) {
    return (
      <div className={`${styles.tagCloudEmpty} ${className}`}>
        <p>暂无标签</p>
      </div>
    );
  }
  
  return (
    <div className={`${styles.tagCloud} ${className}`}>
      {displayTags.map((tag) => (
        <Link
          key={tag.slug}
          href={normalizeHrefInRuntime(tag.route)}
          className={styles.tagLink}
          style={getTagStyle(tag)}
          title={`${tag.name} - ${tag.count} 篇文章`}
          onClick={() => handleTagClick(tag)}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
};
