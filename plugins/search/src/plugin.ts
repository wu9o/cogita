import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import type { SearchDocument } from './types';
import { createSearchIndexHash, extractSearchDocuments, resolveSearchConfig } from './utils';

/** 创建本地文章搜索插件。 */
export function pluginSearch(config: CogitaPluginConfig): RspressPlugin | null {
  const logger = getCogitaLogger(config);
  const searchConfig = config.search;

  if (!searchConfig || searchConfig.enabled === false) {
    logger.info('[Search Plugin] 搜索配置未启用，跳过搜索功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  const finalConfig = resolveSearchConfig(searchConfig);
  let documents: SearchDocument[] = [];
  let indexHash = '';

  return {
    name: '@cogita/plugin-search',

    async beforeBuild() {
      const postsConfig = config.posts || {};
      documents = await extractSearchDocuments(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        finalConfig,
        buildContext.contentIndex,
        logger
      );
      indexHash = createSearchIndexHash(documents);
      logger.info(`[Search Plugin] 已生成 ${documents.length} 个搜索文档`);
    },

    addPages() {
      const searchLayout = buildContext.themeLayouts?.search;
      if (!searchLayout) {
        logger.warn('[Search Plugin] 主题未提供 pageLayouts.search，跳过搜索页面生成');
        return [];
      }

      return [
        {
          routePath: `/${finalConfig.routePrefix}`,
          content: '---\npageType: search\nsidebar: false\n---',
          filepath: searchLayout,
        },
      ];
    },

    addRuntimeModules() {
      return {
        'virtual-search-data': `
          export const searchConfig = ${JSON.stringify(finalConfig)};
          export const searchDocuments = ${JSON.stringify(documents)};
          export const searchIndexHash = ${JSON.stringify(indexHash)};
        `,
      };
    },
  };
}

export default pluginSearch;
