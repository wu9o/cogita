import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import type { ReadingStats } from './types';
import { extractReadingStats, resolveReadingProgressConfig } from './utils';

/** 创建阅读进度与阅读时间插件。 */
export function pluginReadingProgress(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  const readingProgressConfig = config.readingProgress;

  if (!readingProgressConfig) {
    logger.info('[Reading Progress Plugin] 未找到阅读进度配置，跳过阅读增强');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  const finalConfig = resolveReadingProgressConfig(readingProgressConfig);
  let readingStats: ReadingStats[] = [];

  if (!finalConfig.enabled) {
    logger.info('[Reading Progress Plugin] 阅读进度配置已关闭，仅提供空运行时模块');
  }

  return {
    name: '@cogita/plugin-reading-progress',
    cogita: {
      providesCapabilities: ['ui.reading-progress'],
      requiresCapabilities: ['content.posts'],
    },

    async beforeBuild() {
      if (!finalConfig.enabled) return;

      const postsConfig = config.posts || {};
      readingStats = await extractReadingStats(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        finalConfig,
        buildContext.contentIndex,
        logger
      );
      logger.info(`[Reading Progress Plugin] 已生成 ${readingStats.length} 篇文章的阅读统计`);
    },

    addRuntimeModules() {
      return {
        'virtual-reading-progress-data': `
          export const readingProgressConfig = ${JSON.stringify(finalConfig)};
          export const readingStatsByRoute = ${JSON.stringify(Object.fromEntries(readingStats.map((stats) => [stats.route, stats])))};
          export function getReadingStats(route) {
            return readingStatsByRoute[route];
          }
        `,
      };
    },
  };
}

export default pluginReadingProgress;
