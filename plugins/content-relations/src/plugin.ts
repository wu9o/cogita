import {
  COGITA_CAPABILITIES,
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import { buildContentRelations } from './utils';

/** 创建可供知识库主题消费的内容关系插件。 */
export function pluginContentRelations(config: CogitaPluginConfig): CogitaPlugin | null {
  const relationConfig = config.contentRelations;
  const logger = getCogitaLogger(config);

  if (!relationConfig || relationConfig.enabled === false) {
    logger.info('[Content Relations Plugin] 内容关系配置未启用，跳过关系功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);
  const postsConfig = config.posts || {};
  const postsDir = postsConfig.dir || 'posts';
  const extensions = postsConfig.extensions || ['md', 'mdx'];
  let relations: Awaited<ReturnType<typeof buildContentRelations>> = [];

  return {
    name: '@cogita/plugin-content-relations',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.CONTENT_RELATIONS],
      requiresCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
    },

    async beforeBuild() {
      relations = await buildContentRelations(buildContext.contentIndex, {
        contentDir: config.contentDir,
        extensions,
        root: buildContext.root,
        postsDir,
        logger,
      });
    },

    addRuntimeModules() {
      const relationMap = Object.fromEntries(relations.map((entry) => [entry.route, entry]));
      return {
        [COGITA_VIRTUAL_MODULE_IDS.CONTENT_RELATIONS_DATA]: createCogitaVirtualModule(`
          export const contentRelations = ${JSON.stringify(relations)};
          export const relationMap = ${JSON.stringify(relationMap)};

          export function getContentRelations(route) {
            return relationMap[route] || { route, outbound: [], inbound: [] };
          }

          export function getBacklinks(route) {
            return getContentRelations(route).inbound;
          }

          export function getOutgoingLinks(route) {
            return getContentRelations(route).outbound;
          }

          export function getRelatedContent(route, limit = 6) {
            const entry = getContentRelations(route);
            const related = [...entry.outbound, ...entry.inbound];
            const seen = new Set();
            return related.filter((item) => {
              if (seen.has(item.route)) return false;
              seen.add(item.route);
              return true;
            }).slice(0, limit);
          }
        `),
      };
    },
  };
}

export default pluginContentRelations;
