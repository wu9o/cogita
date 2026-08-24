import { getCogitaBuildContext } from '@cogita/shared';
import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import type { CollectionData, CollectionStats, CollectionsConfig } from './types';
import {
  calculateCollectionStats,
  extractCollectionsFromPosts,
  processCollectionsFromPosts,
} from './utils';

export function pluginCollections(config: CogitaPluginConfig): RspressPlugin | null {
  const collectionsConfig = config.collections;

  // 未配置或明确禁用则跳过
  if (!collectionsConfig || collectionsConfig.enabled === false) {
    console.log('[Collections Plugin] Collections 配置未启用，跳过合集功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  // 创建完整配置，应用默认值
  const finalCollectionsConfig: Required<CollectionsConfig> = {
    enabled: true,
    routePrefix: collectionsConfig.routePrefix ?? 'collections',
    metadata: collectionsConfig.metadata ?? {},
    excludeCollections: collectionsConfig.excludeCollections ?? [],
    minPostCount: collectionsConfig.minPostCount ?? 1,
  };

  // 插件内部状态
  let allCollectionsData: CollectionData[] = [];
  let collectionMap: Map<string, CollectionData> = new Map();
  let collectionStats: CollectionStats = {} as CollectionStats;

  return {
    name: '@cogita/plugin-collections',

    async beforeBuild() {
      console.log('[Collections Plugin] 开始初始化合集插件...');

      try {
        const postsConfig = config.posts || {};
        const postsDir = postsConfig.dir || 'posts';
        const cwd = buildContext.cwd || process.cwd();
        const routePrefix = postsConfig.routePrefix || 'posts';

        console.log(`[Collections Plugin] 扫描文章目录: ${postsDir}`);

        const postsData = await extractCollectionsFromPosts(
          postsDir,
          cwd,
          routePrefix,
          buildContext.contentIndex
        );

        const { collectionsData, collectionsMap } = processCollectionsFromPosts(
          postsData,
          finalCollectionsConfig
        );

        allCollectionsData = collectionsData;
        collectionMap = collectionsMap;
        collectionStats = calculateCollectionStats(collectionsData);

        console.log(
          `[Collections Plugin] 成功处理 ${allCollectionsData.length} 个合集，来自 ${postsData.length} 篇文章`
        );
        if (collectionStats.largest) {
          console.log(
            `[Collections Plugin] 最大合集: ${collectionStats.largest.title} (${collectionStats.largest.count} 篇文章)`
          );
        }
      } catch (error) {
        console.error('[Collections Plugin] 初始化失败:', error);
      }
    },

    addRuntimeModules() {
      return {
        'virtual-collections-data': `
          export const allCollections = ${JSON.stringify(allCollectionsData)};
          export const collectionMap = ${JSON.stringify(Object.fromEntries(collectionMap))};
          export const collectionsConfig = ${JSON.stringify(finalCollectionsConfig)};
          export const collectionStats = ${JSON.stringify(collectionStats)};

          export function getCollectionBySlug(slug) {
            return allCollections.find(c => c.slug === slug);
          }

          export function getPostsByCollection(slug) {
            const collection = collectionMap[slug];
            return collection ? collection.posts : [];
          }

          export function getCollectionByPostRoute(route) {
            return allCollections.find(c => c.posts.some(p => p.route === route));
          }
        `,
      };
    },

    async addPages() {
      const collectionLayout = buildContext.themeLayouts?.collection;

      if (!collectionLayout) {
        console.warn(
          '[Collections Plugin] 主题未提供 pageLayouts.collection，跳过合集页面生成。' +
            '请在主题 getThemeConfig() 中声明 pageLayouts.collection 以启用合集页面。'
        );
        return [];
      }

      const pages = [];

      // 1. 合集索引页 (/collections)
      pages.push({
        routePath: `/${finalCollectionsConfig.routePrefix}`,
        content: '---\npageType: collectionIndex\nsidebar: false\n---',
        filepath: collectionLayout,
      });

      // 2. 每个合集的详情页 (/collections/:slug)
      for (const collection of allCollectionsData) {
        pages.push({
          routePath: collection.route,
          content: '---\npageType: collection\nsidebar: false\n---',
          filepath: collectionLayout,
        });
      }

      console.log(`[Collections Plugin] 生成 ${pages.length} 个合集页面`);
      return pages;
    },
  };
}
