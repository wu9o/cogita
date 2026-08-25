import fs from 'node:fs';
import { createCogitaLogger } from '@cogita/shared';
import type { CogitaLogger, ContentIndex, ContentPost } from '@cogita/shared';
import type { ReadingProgressConfig, ReadingStats, ResolvedReadingProgressConfig } from './types';

/** 规范化阅读进度配置。 */
export function resolveReadingProgressConfig(
  config?: ReadingProgressConfig
): ResolvedReadingProgressConfig {
  const wordsPerMinute = Number.isFinite(config?.wordsPerMinute)
    ? Math.floor(config?.wordsPerMinute as number)
    : 300;

  return {
    enabled: config?.enabled !== false,
    showBar: config?.showBar !== false,
    showReadingTime: config?.showReadingTime !== false,
    showTocProgress: config?.showTocProgress !== false,
    rememberPosition: config?.rememberPosition === true,
    wordsPerMinute: Math.max(1, wordsPerMinute),
    includeCode: config?.includeCode === true,
  };
}

/** 清洗 Markdown，保留适合阅读时间估算的文本。 */
export function cleanMarkdownForReading(markdown: string, includeCode: boolean): string {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[^\n]*\n([\s\S]*?)```/g, includeCode ? '$1' : ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/(^|\s)[>*+-]\s+/g, '$1')
    .replace(/[|*_~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 计算中文字符与拉丁单词组成的阅读单位数量。 */
export function countReadingWords(text: string): number {
  const chineseCharacters = text.match(/[\u3400-\u9fff]/g)?.length || 0;
  const latinWords =
    text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?/g)?.length || 0;

  return chineseCharacters + latinWords;
}

/** 根据正文生成阅读统计。 */
export function createReadingStats(
  post: ContentPost,
  markdown: string,
  config: ResolvedReadingProgressConfig
): ReadingStats {
  const wordCount = countReadingWords(cleanMarkdownForReading(markdown, config.includeCode));

  return {
    title: post.title,
    route: post.route,
    wordCount,
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / config.wordsPerMinute)),
    createDate: post.createDate,
    updateDate: post.updateDate,
  };
}

/** 扫描文章正文并生成阅读统计。 */
export async function extractReadingStats(
  _postsDir: string,
  _cwd: string,
  _routePrefix: string,
  _extensions: string[],
  config: ResolvedReadingProgressConfig,
  contentIndex?: ContentIndex,
  logger: CogitaLogger = createCogitaLogger()
): Promise<ReadingStats[]> {
  if (contentIndex) {
    const posts = await contentIndex.getPosts();
    return posts
      .map((post) => {
        try {
          return createReadingStats(
            { ...post, url: post.url || post.route },
            fs.readFileSync(post.filePath, 'utf8'),
            config
          );
        } catch (error) {
          logger.warn(`[Reading Progress Plugin] 读取文章正文失败：${post.filePath}`, error);
          return null;
        }
      })
      .filter((stats): stats is ReadingStats => stats !== null)
      .sort((left, right) => left.route.localeCompare(right.route));
  }

  logger.warn('[Reading Progress Plugin] 未找到共享内容索引，跳过阅读统计构建');
  return [];
}
