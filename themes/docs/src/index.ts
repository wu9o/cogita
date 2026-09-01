import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginI18n } from '@cogita/plugin-i18n';
import type { CogitaTheme } from '@cogita/shared';

/** 技术文档主题配置，面向框架手册、API 参考和开发指南。 */
export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-docs',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: path.resolve(__dirname, './theme.css'),
    plugins: [pluginI18n],
  };
}
