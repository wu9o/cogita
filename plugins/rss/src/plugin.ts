import fs from 'node:fs';
import path from 'node:path';
import {
  COGITA_CAPABILITIES,
  COGITA_VIRTUAL_MODULE_IDS,
  createCogitaVirtualModule,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
/**
 * RSS插件主体实现
 */
import { RSSGenerator } from './generator';
import type { FeedMeta, RSSConfig, RSSPost } from './types';

export function pluginRSS(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  // Enhanced configuration handling - the plugin now handles all validation internally
  const rssConfig = config.rss;

  // Early return if RSS is not configured
  if (!rssConfig) {
    logger.info('[RSS Plugin] RSS 配置未找到，跳过 RSS 功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  // Validate required configuration
  if (!rssConfig.title || !rssConfig.description) {
    logger.warn('[RSS Plugin] RSS 配置缺少必需字段 (title, description)，跳过 RSS 功能');
    return null;
  }

  // Create the complete RSS configuration with defaults
  const finalRssConfig = {
    title: rssConfig.title,
    description: rssConfig.description,
    formats: (rssConfig.formats as ('rss' | 'atom' | 'json')[]) || ['rss'],
    maxItems: (rssConfig.maxItems as number) || 20,
    language: (rssConfig.language as string) || 'en',
    feedPath: (rssConfig.feedPath as string) || 'rss.xml',
    atomPath: (rssConfig.atomPath as string) || 'atom.xml',
    jsonPath: (rssConfig.jsonPath as string) || 'feed.json',
    includeContent: (rssConfig.includeContent as boolean) ?? false,
    // Use site URL as fallback
    link: (rssConfig.link as string) || config.site?.url || 'http://localhost:3000',
  };

  let generator: RSSGenerator;
  let posts: RSSPost[] = [];
  let feedMeta: FeedMeta = {};
  let outputDir = 'doc_build'; // 默认输出目录

  return {
    name: '@cogita/plugin-rss',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.SYNDICATION_RSS],
      requiresCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
    },

    async beforeBuild(rspressConfig: unknown) {
      logger.info('[RSS Plugin] 开始初始化RSS插件...');

      // 获取站点URL配置和输出目录
      const siteUrl = finalRssConfig.link;
      const rspressConfigObj = rspressConfig as Record<string, unknown>;
      outputDir =
        ((rspressConfigObj.output as Record<string, unknown>)?.path as string) || 'doc_build';

      try {
        // 初始化RSS生成器
        generator = new RSSGenerator(finalRssConfig as RSSConfig, siteUrl);

        if (buildContext.contentIndex) {
          const indexedPosts = (await buildContext.contentIndex.getPosts()).map((post) => ({
            ...post,
            url: post.url || post.route,
          }));
          if (finalRssConfig.includeContent && buildContext.contentIndex.getPostContent) {
            posts = await Promise.all(
              indexedPosts.map(async (post) => ({
                ...post,
                content: await buildContext.contentIndex?.getPostContent?.(post.filePath),
              }))
            );
          } else {
            if (finalRssConfig.includeContent) {
              logger.warn('[RSS Plugin] 当前内容索引不支持正文缓存，Feed 将只输出摘要');
            }
            posts = indexedPosts;
          }
        } else {
          logger.warn('[RSS Plugin] 未找到共享内容索引，跳过 RSS 数据构建');
          posts = [];
        }

        // 按创建日期降序排序
        posts.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

        logger.info(`[RSS Plugin] 成功处理 ${posts.length} 篇文章`);

        // 生成feed元数据
        feedMeta = generator.generateFeedMeta();
        logger.info('[RSS Plugin] Feed元数据生成完成:', Object.keys(feedMeta));
      } catch (error) {
        logger.error('[RSS Plugin] 初始化失败:', error);
        // 不抛出错误，让构建继续，但RSS功能将不可用
        posts = [];
        feedMeta = {};
      }
    },

    async afterBuild() {
      if (posts.length === 0) {
        logger.warn('[RSS Plugin] 没有找到文章，跳过RSS文件生成');
        return;
      }

      if (!generator) {
        logger.error('[RSS Plugin] 生成器未初始化');
        return;
      }

      const formats = generator.getConfig().formats;

      try {
        // 生成RSS文件
        if (formats.includes('rss')) {
          const rssContent = generator.generateRSS(posts);
          const rssPath = path.join(outputDir, generator.getConfig().feedPath);
          fs.writeFileSync(rssPath, rssContent, 'utf-8');
          logger.info(`[RSS Plugin] RSS 2.0 feed 已写入: ${rssPath}`);
        }

        // 生成Atom文件
        if (formats.includes('atom')) {
          const atomContent = generator.generateAtom(posts);
          const atomPath = path.join(outputDir, generator.getConfig().atomPath);
          fs.writeFileSync(atomPath, atomContent, 'utf-8');
          logger.info(`[RSS Plugin] Atom feed 已写入: ${atomPath}`);
        }

        // 生成JSON Feed文件
        if (formats.includes('json')) {
          const jsonContent = generator.generateJSON(posts);
          const jsonPath = path.join(outputDir, generator.getConfig().jsonPath);
          fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
          logger.info(`[RSS Plugin] JSON feed 已写入: ${jsonPath}`);
        }

        logger.info('[RSS Plugin] 所有RSS文件生成完成');
      } catch (error) {
        logger.error('[RSS Plugin] 生成RSS文件时出错:', error);
      }
    },

    addRuntimeModules() {
      // 向客户端暴露feed元数据
      return {
        [COGITA_VIRTUAL_MODULE_IDS.RSS_META]: createCogitaVirtualModule(
          `export const feedMeta = ${JSON.stringify(feedMeta, null, 2)};`
        ),
      };
    },

    // 注意：modifyHTML钩子在当前版本的Rspress中不可用
    // feed发现链接通过主题模板手动添加
    // 或者可以考虑使用其他钩子来实现HTML注入功能
  };
}

/**
 * 插件工厂函数的类型安全包装（保留用于向后兼容）
 */
export function createRSSPlugin(rssConfig: RSSConfig) {
  return (config: CogitaPluginConfig) =>
    pluginRSS({
      ...config,
      rss: {
        ...rssConfig,
        // 可以从config中获取默认值
        link: rssConfig.link || config.site?.url || 'http://localhost:3000',
      },
    });
}
