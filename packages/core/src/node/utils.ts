import { createRequire } from 'node:module';
import path from 'node:path';
import type { CogitaConfig } from '../types';

const require = createRequire(import.meta.url);

export function transformConfig(root: string, config: CogitaConfig): any {
  const themePackage = config.theme || '@cogita/theme-lucid';
  // Resolve the theme's main entry point from its exports
  const themeEntryPoint = require.resolve(themePackage);

  return {
    root: path.join(root, 'posts'),
    title: config.site?.title,
    description: config.site?.description,
    base: config.site?.base,
    // Use Rspress's official API to apply the theme layout
    globalUIComponents: [themeEntryPoint],
  };
}
