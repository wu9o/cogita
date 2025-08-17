import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-lucid',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: [path.resolve(__dirname, './theme.css')],
    plugins: [pluginPostsFrontmatter],
  };
}

export * from './Layout';
