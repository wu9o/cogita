import type { CogitaConfig } from '../types';

/** 内置主题别名统一映射，避免不同运行流程使用不一致的解析规则。 */
export const BUILT_IN_THEMES: Record<string, string> = {
  lucid: '@cogita/theme-lucid',
  editorial: '@cogita/theme-editorial',
};

export function resolveThemePackage(config: Pick<CogitaConfig, 'theme'>): string {
  const theme = config.theme || 'lucid';
  return BUILT_IN_THEMES[theme] || theme;
}
