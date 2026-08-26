import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CogitaTheme } from '@cogita/shared';

/** 返回第三方主题的最小配置，主题只负责布局与样式。 */
export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@your-scope/cogita-theme-starter',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: path.resolve(__dirname, './theme.css'),
  };
}
