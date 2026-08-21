import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginCollections } from '@cogita/plugin-collections';
import { pluginImages } from '@cogita/plugin-images';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginRSS } from '@cogita/plugin-rss';
import { pluginSEO } from '@cogita/plugin-seo';
import { pluginSitemap } from '@cogita/plugin-sitemap';
import { pluginTags } from '@cogita/plugin-tags';
import type { CogitaTheme } from '@cogita/shared';

/**
 * Lucid 主题配置
 *
 * 架构设计：
 * 1. 主题内置能力（非插件）：
 *    - globalStyles: 主题样式文件
 *    - globalUIComponents: 全局 UI 组件（Footer 等）
 *    - pageLayouts: 页面布局
 *
 * 2. 功能插件（可选、可配置）：
 *    - pluginPostsFrontmatter: 文章元数据处理
 *    - pluginRSS: RSS feed 生成
 *
 * 原则：
 * - 样式和组件是主题的核心，不应作为"插件"
 * - 只有业务功能才应该封装为插件
 */
export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-lucid',

    // ============================================
    // 主题内置能力（不是插件）
    // ============================================

    // 页面布局
    pageLayouts: {
      home: './layouts/Home.js',
      tag: './layouts/Tag.js',
      collection: './layouts/Collection.js',
    },

    // 主题样式（会通过 cogita-theme-plugin 自动加载）
    globalStyles: path.resolve(__dirname, './theme.css'),

    // 全局 UI 组件（会通过 cogita-theme-plugin 自动注册）
    globalUIComponents: [
      path.resolve(__dirname, './components/Footer.js'),
      path.resolve(__dirname, './components/CollectionNav.js'),
    ],

    // ============================================
    // 功能插件（可选、可配置）
    // ============================================

    plugins: [
      // Posts 元数据处理插件
      pluginPostsFrontmatter,

      // 公共图片清单与文章封面元数据插件
      pluginImages,

      // RSS feed 生成插件
      pluginRSS,

      // XML 站点地图生成插件
      pluginSitemap,

      // 页面级 SEO 元数据插件
      pluginSEO,

      // 标签管理插件
      pluginTags,

      // 合集（系列文章）插件
      pluginCollections,
    ],
  };
}

export * from './Layout';
