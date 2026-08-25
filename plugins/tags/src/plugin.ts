import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig, ContentPost } from '@cogita/shared';
import type { TagData, TagStats, TagsConfig } from './types';
import { calculateTagStats, extractTagsFromPosts, processTagsFromPosts } from './utils';

export function pluginTags(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  // 配置验证和默认值处理
  const tagsConfig = config.tags;

  // 如果未配置或明确禁用，则跳过
  if (!tagsConfig || tagsConfig.enabled === false) {
    logger.info('[Tags Plugin] Tags 配置未启用，跳过标签功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  // 创建完整的标签配置，应用默认值
  const finalTagsConfig = {
    enabled: true,
    routePrefix: tagsConfig.routePrefix || 'tags',
    tagCloud: {
      minFontSize: 12,
      maxFontSize: 24,
      minOpacity: 0.5,
      maxOpacity: 1.0,
      sortBy: 'count' as const,
      limit: 50,
      ...tagsConfig.tagCloud,
    },
    // TODO: layout 字段预留给主题切换标签页布局，当前未消费
    layout: (tagsConfig.layout as string) || 'tag',
    tagTransform: (tagsConfig.tagTransform as (tag: string) => string) || ((tag: string) => tag),
    excludeTags: (tagsConfig.excludeTags as string[]) || [],
    minPostCount: (tagsConfig.minPostCount as number) || 1,
  };

  // 插件内部状态
  let allTagsData: TagData[] = [];
  let tagMap: Map<string, TagData> = new Map();
  let postsData: ContentPost[] = [];
  let tagStats: TagStats = {} as TagStats;

  return {
    name: '@cogita/plugin-tags',
    cogita: {
      providesCapabilities: ['discovery.tags'],
      requiresCapabilities: ['content.posts'],
      requiredLayouts: [{ layout: 'tag', label: '标签' }],
    },

    async beforeBuild() {
      logger.info('[Tags Plugin] 开始初始化标签插件...');

      try {
        // 获取文章配置
        const postsConfig = config.posts || {};
        const postsDir = postsConfig.dir || 'posts';
        const cwd = buildContext.cwd || process.cwd();
        const routePrefix = postsConfig.routePrefix || 'posts';

        logger.info(`[Tags Plugin] 扫描文章目录: ${postsDir}`);

        // 提取文章数据
        postsData = await extractTagsFromPosts(
          postsDir,
          cwd,
          routePrefix,
          buildContext.contentIndex,
          logger
        );

        if (postsData.length === 0) {
          logger.warn('[Tags Plugin] 未找到文章，跳过标签处理');
          return;
        }

        // 处理标签数据
        const { tagsData, tagsMap: processedTagsMap } = processTagsFromPosts(
          postsData,
          finalTagsConfig,
          logger
        );

        allTagsData = tagsData;
        tagMap = processedTagsMap;

        // 计算标签统计
        tagStats = calculateTagStats(allTagsData, postsData);

        logger.info(
          `[Tags Plugin] 成功处理 ${allTagsData.length} 个标签，来自 ${postsData.length} 篇文章`
        );
        if (tagStats.hottest?.name) {
          logger.info(
            `[Tags Plugin] 最热门标签: ${tagStats.hottest.name} (${tagStats.hottest.count} 篇文章)`
          );
        }
      } catch (error) {
        logger.error('[Tags Plugin] 初始化失败:', error);
        // 不抛出错误，让构建继续，但标签功能将不可用
        allTagsData = [];
        tagMap = new Map();
        postsData = [];
        tagStats = {} as TagStats;
      }
    },

    addPages() {
      if (allTagsData.length === 0) {
        logger.warn('[Tags Plugin] 没有标签数据，跳过页面生成');
        return [];
      }

      const pages = [];
      const tagLayout = buildContext.themeLayouts?.tag;
      const routePrefix = finalTagsConfig.routePrefix;

      if (tagLayout) {
        // React 组件方案：filepath 指向主题 TagPageLayout，content 只含 frontmatter
        // TagPageLayout 根据 routePath 判断渲染索引页还是详情页
        pages.push({
          routePath: `/${routePrefix}`,
          content: '---\npageType: tagIndex\nsidebar: false\n---',
          filepath: tagLayout,
        });

        for (const tag of allTagsData) {
          pages.push({
            routePath: tag.route,
            content: '---\npageType: tag\nsidebar: false\n---',
            filepath: tagLayout,
          });
        }
      } else {
        // 主题未提供 tag 布局，跳过页面生成
        logger.warn(
          '[Tags Plugin] 主题未提供 pageLayouts.tag，跳过标签页面生成。' +
            '请在主题 getThemeConfig() 中声明 pageLayouts.tag 以启用标签页面。'
        );
      }

      logger.info(`[Tags Plugin] 生成 ${pages.length} 个标签页面`);
      return pages;
    },

    addRuntimeModules() {
      // 创建虚拟模块暴露标签数据给主题组件
      return {
        'virtual-tags-data': `
          export const allTags = ${JSON.stringify(allTagsData)};
          export const tagMap = ${JSON.stringify(Object.fromEntries(tagMap))};
          export const tagsConfig = ${JSON.stringify(finalTagsConfig)};
          export const tagStats = ${JSON.stringify(tagStats)};
          
          export function getTagBySlug(slug) {
            return allTags.find(tag => tag.slug === slug);
          }
          
          export function getPostsByTag(tagName) {
            const tag = tagMap[tagName];
            return tag ? tag.posts : [];
          }
          
          export function getRelatedTags(currentTag, limit = 5) {
            const currentTagData = allTags.find(tag => tag.name === currentTag);
            if (!currentTagData) return [];
            
            const currentTagPosts = new Set(currentTagData.posts.map(p => p.route));
            
            return allTags
              .filter(tag => tag.name !== currentTag)
              .map(tag => ({
                ...tag,
                relevance: tag.posts.filter(post => currentTagPosts.has(post.route)).length
              }))
              .filter(tag => tag.relevance > 0)
              .sort((a, b) => b.relevance - a.relevance)
              .slice(0, limit)
              .map(({ relevance, ...tag }) => tag);
          }
        `,
      };
    },
  };
}
