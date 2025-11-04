import type { CogitaTheme, LayoutProps } from '@cogita/shared';
import type { UserConfig } from '@rspress/core';

export type { CogitaTheme, LayoutProps };

export type ThemeConfig = UserConfig['themeConfig'];
export type BuilderConfig = UserConfig['builderConfig'];

export interface SiteConfig {
  title?: string;
  description?: string;
  base?: string;
  url?: string;
}

/**
 * Posts plugin configuration
 */
export interface PostsConfig {
  /**
   * Directory containing posts
   * @default 'posts'
   */
  dir?: string;
  /**
   * Route prefix for posts
   * @default 'posts'
   */
  routePrefix?: string;
  /**
   * File extensions to include
   * @default ['md', 'mdx']
   */
  extensions?: string[];
}

/**
 * RSS plugin configuration
 */
export interface RSSConfig {
  /**
   * Feed title
   */
  title: string;
  /**
   * Feed description
   */
  description: string;
  /**
   * Website URL (will fallback to site.url)
   */
  link?: string;
  /**
   * Feed language
   * @default 'en'
   */
  language?: string;
  /**
   * Copyright notice
   */
  copyright?: string;
  /**
   * Managing editor email
   */
  managingEditor?: string;
  /**
   * Webmaster email
   */
  webMaster?: string;
  /**
   * Feed formats to generate
   * @default ['rss']
   */
  formats?: ('rss' | 'atom' | 'json')[];
  /**
   * RSS file path
   * @default 'rss.xml'
   */
  feedPath?: string;
  /**
   * Atom file path
   * @default 'atom.xml'
   */
  atomPath?: string;
  /**
   * JSON feed file path
   * @default 'feed.json'
   */
  jsonPath?: string;
  /**
   * Maximum items in feed
   * @default 20
   */
  maxItems?: number;
  /**
   * Include full content
   * @default false
   */
  includeContent?: boolean;
  /**
   * Custom field mapping
   */
  customFields?: {
    author?: string;
    category?: string;
  };
}

export interface CogitaConfig {
  site?: SiteConfig;
  theme?: string;

  /**
   * Posts plugin configuration
   */
  posts?: PostsConfig;

  /**
   * RSS feed configuration
   */
  rss?: RSSConfig;

  /**
   * Rspress theme config
   * @see https://rspress.rs/api/config/config-theme
   */
  themeConfig?: ThemeConfig;

  /**
   * Rspress builder config
   * @see https://rspress.rs/api/config/config-builder
   */
  builderConfig?: BuilderConfig;

  /**
   * Strict mode - fail build on plugin errors
   * @default true
   */
  strict?: boolean;
}

/**
 * Full configuration object passed to plugin factories
 */
export interface CogitaFullConfig extends CogitaConfig {
  root: string;
  cwd: string;
  _framework: {
    version: string;
    buildTime: string;
  };
}
