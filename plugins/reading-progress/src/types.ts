/** 阅读进度插件配置。 */
export interface ReadingProgressConfig {
  /** 是否启用插件。 */
  enabled?: boolean;
  /** 是否显示文章顶部的阅读进度条。 */
  showBar?: boolean;
  /** 是否显示预计阅读时间和实时进度。 */
  showReadingTime?: boolean;
  /** 每分钟阅读单位数，中文按字符、英文按单词估算。 */
  wordsPerMinute?: number;
  /** 是否把代码块纳入阅读时间计算。 */
  includeCode?: boolean;
}

/** 阅读进度插件的最终配置。 */
export interface ResolvedReadingProgressConfig {
  enabled: boolean;
  showBar: boolean;
  showReadingTime: boolean;
  wordsPerMinute: number;
  includeCode: boolean;
}

/** 单篇文章的阅读统计。 */
export interface ReadingStats {
  title: string;
  route: string;
  wordCount: number;
  readingTimeMinutes: number;
  createDate: string;
  updateDate: string;
}
