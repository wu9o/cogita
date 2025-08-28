import fs from 'node:fs';
import path from 'node:path';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
/**
 * RSS插件主体实现
 */
import type { RspressPlugin } from '@rspress/core';
import { glob } from 'glob';
import { RSSGenerator } from './generator';
import type { FeedMeta, RSSConfig } from './types';

// 定义PostFrontmatter接口（与posts-frontmatter插件兼容）
interface PostFrontmatter {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  url: string;
}

export function pluginRSS(config: RSSConfig): RspressPlugin {
  let generator: RSSGenerator;
  let posts: PostFrontmatter[] = [];
  let feedMeta: FeedMeta = {};
  let outputDir = 'doc_build'; // 默认输出目录

  return {
    name: '@cogita/plugin-rss',

    async beforeBuild(rspressConfig: any, isProd: boolean) {
      console.log('[RSS Plugin] 开始初始化RSS插件...');

      // 获取站点URL配置和输出目录
      const siteUrl = config.link || 'http://localhost:3000';
      outputDir = rspressConfig.output?.path || 'doc_build';

      try {
        // 初始化RSS生成器
        generator = new RSSGenerator(config, siteUrl);

        // 直接扫描文章文件（与posts-frontmatter插件使用相同的逻辑）
        const postsDir = rspressConfig.postsDir || 'posts';
        const cwd = rspressConfig.cwd || process.cwd();
        const routePrefix = rspressConfig.routePrefix || 'posts';

        console.log(`[RSS Plugin] 扫描文章目录: ${postsDir}`);

        // 执行glob匹配，获取所有markdown文件
        const absolutePaths = await glob(`${postsDir}/**/*.{md,mdx}`, {
          absolute: true,
          cwd,
          nodir: true,
        });

        // 提取frontmatter数据
        posts = absolutePaths
          .map((filePath: string) => {
            try {
              return getFrontmatterFromFile(filePath, postsDir, routePrefix);
            } catch (error) {
              console.warn(`[RSS Plugin] 跳过文件 ${filePath}:`, error);
              return null;
            }
          })
          .filter(Boolean) as PostFrontmatter[];

        // 按创建日期降序排序
        posts.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

        console.log(`[RSS Plugin] 成功处理 ${posts.length} 篇文章`);

        // 生成feed元数据
        feedMeta = generator.generateFeedMeta();
        console.log('[RSS Plugin] Feed元数据生成完成:', Object.keys(feedMeta));
      } catch (error) {
        console.error('[RSS Plugin] 初始化失败:', error);
        // 不抛出错误，让构建继续，但RSS功能将不可用
        posts = [];
        feedMeta = {};
      }
    },

    async afterBuild() {
      if (posts.length === 0) {
        console.warn('[RSS Plugin] 没有找到文章，跳过RSS文件生成');
        return;
      }

      if (!generator) {
        console.error('[RSS Plugin] 生成器未初始化');
        return;
      }

      const formats = generator.getConfig().formats;

      try {
        // 生成RSS文件
        if (formats.includes('rss')) {
          const rssContent = generator.generateRSS(posts);
          const rssPath = path.join(outputDir, generator.getConfig().feedPath);
          fs.writeFileSync(rssPath, rssContent, 'utf-8');
          console.log(`[RSS Plugin] RSS 2.0 feed 已写入: ${rssPath}`);
        }

        // 生成Atom文件
        if (formats.includes('atom')) {
          const atomContent = generator.generateAtom(posts);
          const atomPath = path.join(outputDir, generator.getConfig().atomPath);
          fs.writeFileSync(atomPath, atomContent, 'utf-8');
          console.log(`[RSS Plugin] Atom feed 已写入: ${atomPath}`);
        }

        // 生成JSON Feed文件
        if (formats.includes('json')) {
          const jsonContent = generator.generateJSON(posts);
          const jsonPath = path.join(outputDir, generator.getConfig().jsonPath);
          fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
          console.log(`[RSS Plugin] JSON feed 已写入: ${jsonPath}`);
        }

        console.log('[RSS Plugin] 所有RSS文件生成完成');
      } catch (error) {
        console.error('[RSS Plugin] 生成RSS文件时出错:', error);
      }
    },

    addRuntimeModules() {
      // 向客户端暴露feed元数据
      return {
        'virtual-rss-meta': `export const feedMeta = ${JSON.stringify(feedMeta, null, 2)};`,
      };
    },

    // 注意：modifyHTML钩子在当前版本的Rspress中不可用
    // feed发现链接通过主题模板手动添加
    // 或者可以考虑使用其他钩子来实现HTML注入功能
  };
}

/**
 * 插件工厂函数的类型安全包装
 */
export function createRSSPlugin(config: RSSConfig) {
  return (rspressConfig: any) =>
    pluginRSS({
      ...config,
      // 可以从rspress配置中获取默认值
      link: config.link || rspressConfig.root || 'http://localhost:3000',
    });
}
