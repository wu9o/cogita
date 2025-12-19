import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginRSS } from '@cogita/plugin-rss';
import { pluginTags } from '@cogita/plugin-tags';
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
      // 统一的简洁插件声明 - 配置处理由框架和插件内部负责
      pluginPostsFrontmatter,
      pluginRSS,
      pluginTags,
    ],
  };
}

export * from './Layout';
