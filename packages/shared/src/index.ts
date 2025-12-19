import type { RspressPlugin, UserConfig } from '@rspress/core';
import type React from 'react';

export const VIRTUAL_CONTENT_DIR = '.cogita_content';

// Export Rspress types for use in themes and plugins
export type { RspressPlugin, UserConfig };

// Enhanced config type for plugin factory functions
export interface CogitaPluginConfig {
  root: string;
  cwd: string;
  site?: {
    title?: string;
    description?: string;
    base?: string;
    url?: string;
  };
  posts?: {
    dir?: string;
    routePrefix?: string;
    extensions?: string[];
  };
  rss?: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    formats?: ('rss' | 'atom' | 'json')[];
    maxItems?: number;
    feedPath?: string;
    atomPath?: string;
    jsonPath?: string;
    includeContent?: boolean;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    customFields?: {
      author?: string;
      category?: string;
    };
    [key: string]: unknown;
  };
  _framework?: {
    version: string;
    buildTime: string;
  };
  strict?: boolean;
  [key: string]: unknown;
}

// A plugin factory function that receives the final config and returns a Rspress plugin.
export type CogitaPluginFactory = (
  config: CogitaPluginConfig
) => RspressPlugin | RspressPlugin[] | null | undefined;

export interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
  };
  // 主题内置能力（不是插件）
  globalStyles?: string; // 主题样式文件路径（单个文件）
  globalUIComponents?: (string | [string, object])[]; // 全局 UI 组件（如 Footer）
  // 主题依赖的功能插件
  plugins?: CogitaPluginFactory[];
}

export interface LayoutProps {
  routePath: string;
  config: UserConfig;
  pageData: Record<string, unknown>;
  children?: React.ReactNode;
}
