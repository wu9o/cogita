declare module 'virtual-reading-progress-data' {
  import type { ReadingProgressConfig, ReadingStats } from '@cogita/plugin-reading-progress';

  export const readingProgressConfig: ReadingProgressConfig;
  export const readingStatsByRoute: Record<string, ReadingStats>;
  export function getReadingStats(route: string): ReadingStats | undefined;
}
