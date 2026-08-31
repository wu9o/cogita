import {
  COGITA_CAPABILITIES,
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import { extractCommentPostRoutes, resolveCommentsConfig, validateCommentsConfig } from './utils';

/** 创建评论插件。 */
export function pluginComments(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  if (!config.comments) {
    logger.info('[Comments Plugin] 未找到评论配置，跳过评论功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  let finalConfig = resolveCommentsConfig(config.comments);
  let configError = validateCommentsConfig(finalConfig);

  if (configError) {
    logger.warn(`[Comments Plugin] ${configError}，评论功能将保持关闭`);
    finalConfig = { ...finalConfig, enabled: false };
  }

  return {
    name: '@cogita/plugin-comments',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.ENGAGEMENT_COMMENTS],
      requiresCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
    },

    async beforeBuild() {
      const postsConfig = config.posts || {};
      const postRoutes = await extractCommentPostRoutes(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        buildContext.contentIndex,
        logger
      );
      finalConfig = resolveCommentsConfig(config.comments, postRoutes);
      configError = validateCommentsConfig(finalConfig);

      if (configError) {
        logger.warn(`[Comments Plugin] ${configError}，评论功能将保持关闭`);
        finalConfig = { ...finalConfig, enabled: false };
      }

      logger.info(
        `[Comments Plugin] ${finalConfig.enabled ? '已启用' : '未启用'}，已识别 ${postRoutes.length} 篇文章`
      );
    },

    addRuntimeModules() {
      return {
        [COGITA_VIRTUAL_MODULE_IDS.COMMENTS_DATA]: createCogitaVirtualModule(`
          export const commentsConfig = ${JSON.stringify(finalConfig)};
        `),
      };
    },
  };
}

export default pluginComments;
