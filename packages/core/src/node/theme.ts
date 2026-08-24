import type { CogitaConfig } from '../types';

/** 保留旧版主题别名，主题包本身由站点项目通过依赖直接提供。 */
export const BUILT_IN_THEMES: Record<string, string> = {
  lucid: '@cogita/theme-lucid',
  editorial: '@cogita/theme-editorial',
};

export function resolveThemePackage(config: Pick<CogitaConfig, 'theme'>): string | undefined {
  if (!config.theme) {
    return undefined;
  }

  return BUILT_IN_THEMES[config.theme] || config.theme;
}
