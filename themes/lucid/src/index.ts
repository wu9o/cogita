import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginRSS } from '@cogita/plugin-rss';
import type { CogitaTheme, RspressPlugin } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // 创建一个插件来加载主题样式
  const themeStylePlugin: RspressPlugin = {
    name: '@cogita/theme-lucid-styles',
    globalStyles: path.resolve(__dirname, './theme.css'),
  };

  return {
    name: '@cogita/theme-lucid',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    plugins: [
      // 主题样式插件（必须第一个加载）
      () => themeStylePlugin,
      // 统一的简洁插件声明 - 配置处理由框架和插件内部负责
      pluginPostsFrontmatter,
      pluginRSS,
    ],
  };
}

export * from './Layout';
