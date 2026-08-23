export { default, pluginReadingProgress } from './plugin';
export type {
  ReadingProgressConfig,
  ReadingStats,
  ResolvedReadingProgressConfig,
} from './types';
export {
  cleanMarkdownForReading,
  countReadingWords,
  createReadingStats,
  extractReadingStats,
  resolveReadingProgressConfig,
} from './utils';
