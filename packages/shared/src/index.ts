import type { RspressPlugin, UserConfig } from '@rspress/core';
import type React from 'react';

export const VIRTUAL_CONTENT_DIR = '.cogita_content';

// A plugin factory function that receives the final config and returns a Rspress plugin.
export type CogitaPluginFactory = (
  config: Record<string, any>
) => RspressPlugin | RspressPlugin[] | null | undefined;

export interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
  };
  globalStyles?: string[];
  plugins?: CogitaPluginFactory[];
}

export interface LayoutProps {
  routePath: string;
  config: UserConfig;
  pageData: Record<string, any>;
  children?: React.ReactNode;
}
