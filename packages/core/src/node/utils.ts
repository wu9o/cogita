import { createRequire } from 'node:module';
import path from 'node:path';
import type { CogitaConfig } from '../types';
import { resolveThemePackage } from './theme';

const require = createRequire(import.meta.url);

interface TransformedConfig {
  root: string;
  title?: string;
  description?: string;
  base?: string;
  globalUIComponents: string[];
}

export function transformConfig(root: string, config: CogitaConfig): TransformedConfig {
  const themePackage = resolveThemePackage(config);
  // 从站点项目解析主题，避免主题只能作为 core 的传递依赖存在。
  const themeEntryPoint = themePackage
    ? require.resolve(themePackage, { paths: [root] })
    : undefined;

  return {
    root: path.join(root, 'posts'),
    title: config.site?.title,
    description: config.site?.description,
    base: config.site?.base,
    // Use Rspress's official API to apply the theme layout
    globalUIComponents: themeEntryPoint ? [themeEntryPoint] : [],
  };
}
