import type { CogitaTheme } from '@cogita/shared';
import type { CogitaConfig } from '../types';

/** 保留旧版主题别名，主题包本身由站点项目通过依赖直接提供。 */
export const BUILT_IN_THEMES: Record<string, string> = {
  lucid: '@cogita/theme-lucid',
  editorial: '@cogita/theme-editorial',
  knowledge: '@cogita/theme-knowledge',
};

export function resolveThemePackage(config: Pick<CogitaConfig, 'theme'>): string | undefined {
  if (!config.theme) {
    return undefined;
  }

  return BUILT_IN_THEMES[config.theme] || config.theme;
}

/** 统一判断主题是否满足 Core 与 CLI 共用的最小主题契约。 */
export function isCogitaThemeConfig(value: unknown): value is CogitaTheme {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const theme = value as Partial<CogitaTheme>;
  return (
    typeof theme.name === 'string' &&
    theme.name.trim().length > 0 &&
    Boolean(theme.pageLayouts) &&
    typeof theme.pageLayouts === 'object' &&
    typeof theme.pageLayouts.home === 'string' &&
    theme.pageLayouts.home.trim().length > 0
  );
}
