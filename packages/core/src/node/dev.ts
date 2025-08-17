import { dev } from '@rspress/core';
import type { CogitaConfig } from '../types';
import { transformConfig } from './utils';

export async function createServer(root: string, config: CogitaConfig): Promise<void> {
  const rspressConfig = transformConfig(root, config);
  await dev({
    root,
    config: rspressConfig,
  } as any);
}
