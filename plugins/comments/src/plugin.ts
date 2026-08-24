import { getCogitaBuildContext } from '@cogita/shared';
import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import { extractCommentPostRoutes, resolveCommentsConfig, validateCommentsConfig } from './utils';

/** 创建评论插件。 */
export function pluginComments(config: CogitaPluginConfig): RspressPlugin | null {
  if (!config.comments) {
    console.log('[Comments Plugin] 未找到评论配置，跳过评论功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  let finalConfig = resolveCommentsConfig(config.comments);
  let configError = validateCommentsConfig(finalConfig);

  if (configError) {
    console.warn(`[Comments Plugin] ${configError}，评论功能将保持关闭`);
    finalConfig = { ...finalConfig, enabled: false };
  }

  return {
    name: '@cogita/plugin-comments',

    async beforeBuild() {
      const postsConfig = config.posts || {};
      const postRoutes = await extractCommentPostRoutes(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        buildContext.contentIndex
      );
      finalConfig = resolveCommentsConfig(config.comments, postRoutes);
      configError = validateCommentsConfig(finalConfig);

      if (configError) {
        console.warn(`[Comments Plugin] ${configError}，评论功能将保持关闭`);
        finalConfig = { ...finalConfig, enabled: false };
      }

      console.log(
        `[Comments Plugin] ${finalConfig.enabled ? '已启用' : '未启用'}，已识别 ${postRoutes.length} 篇文章`
      );
    },

    addRuntimeModules() {
      return {
        'virtual-comments-data': `
          export const commentsConfig = ${JSON.stringify(finalConfig)};
        `,
      };
    },
  };
}

export default pluginComments;
