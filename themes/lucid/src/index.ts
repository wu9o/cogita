import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginRSS } from '@cogita/plugin-rss';
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
    },

    // 主题样式（会通过 cogita-theme-plugin 自动加载）
    globalStyles: path.resolve(__dirname, './theme.css'),

    // 全局 UI 组件（会通过 cogita-theme-plugin 自动注册）
    globalUIComponents: [
      path.resolve(__dirname, './components/Footer.js'),
    ],

    // ============================================
    // 功能插件（可选、可配置）
    // ============================================
    
    plugins: [
      // Posts 元数据处理插件
      pluginPostsFrontmatter,
      
      // RSS feed 生成插件
      pluginRSS,
    ],
  };
}

export * from './Layout';
