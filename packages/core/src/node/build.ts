import { build as rspressBuild } from '@rspress/core';
import type { CogitaConfig } from '../types';
import { transformConfig } from './utils';

export async function build(root: string, config: CogitaConfig) {
  const rspressConfig = transformConfig(root, config);
  await rspressBuild({
    root,
    config: rspressConfig,
  } as any);
}
