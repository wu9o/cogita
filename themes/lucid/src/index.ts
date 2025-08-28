import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginRSS } from '@cogita/plugin-rss';
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-lucid',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: [path.resolve(__dirname, './theme.css')],
    plugins: [
      pluginPostsFrontmatter,
      // RSS插件工厂函数 - 从配置中读取RSS配置，提供默认值
      pluginRSS,
    ],
  };
}

export * from './Layout';
