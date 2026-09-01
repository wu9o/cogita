import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig, ContentEntry } from '@cogita/shared';

/** 为能够提供正文的外部内容源生成静态 Markdown 页面。 */
export function createContentSourcePagesPlugin(config: CogitaPluginConfig): CogitaPlugin {
  const buildContext = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);
  let pages: Array<{ routePath: string; content: string }> = [];

  return {
    name: 'cogita-content-source-pages',

    async beforeBuild() {
      pages = [];
      const contentIndex = buildContext.contentIndex;
      if (!contentIndex?.getEntries || !contentIndex.getPostContent) {
        return;
      }
      const getPostContent = contentIndex.getPostContent;

      const sourceEntries = (await contentIndex.getEntries()).filter(
        (entry): entry is ContentEntry & { sourceId: string } => Boolean(entry.sourceId)
      );
      pages = (
        await Promise.all(
          sourceEntries.map(async (entry) => {
            try {
              return {
                routePath: entry.route,
                content: await getPostContent(entry.filePath),
              };
            } catch (error) {
              logger.warn(`[Cogita] 外部内容源条目没有可渲染正文，跳过页面：${entry.route}`, error);
              return null;
            }
          })
        )
      ).filter((page): page is { routePath: string; content: string } => page !== null);
    },

    addPages() {
      return pages;
    },
  };
}
