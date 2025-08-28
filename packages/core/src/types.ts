import type { CogitaTheme, LayoutProps } from '@cogita/shared';
import type { UserConfig } from '@rspress/core';

export type { CogitaTheme, LayoutProps };

export type ThemeConfig = UserConfig['themeConfig'];
export type BuilderConfig = UserConfig['builderConfig'];

export interface SiteConfig {
  title?: string;
  description?: string;
  base?: string;
}

export interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;
  /**
   * RSS feed configuration.
   */
  rss?: Record<string, unknown>;
  /**
   * Rspress theme config.
   * @see https://rspress.rs/api/config/config-theme
   */
  themeConfig?: ThemeConfig;
  /**
   * Rspress builder config.
   * @see https://rspress.rs/api/config/config-builder
   */
  builderConfig?: BuilderConfig;
}
