import path from 'node:path';
import { VIRTUAL_CONTENT_DIR } from '@cogita/shared';
import { build } from '@rspress/core';
import { createRspressConfig, loadCogitaConfig } from './config';

export async function createBuild(root: string) {
  const cogitaConfig = await loadCogitaConfig(root);
  const rspressConfig = await createRspressConfig(cogitaConfig, root);

  const appDirectory = root;
  const docDirectory = path.join(root, VIRTUAL_CONTENT_DIR);

  await build({
    appDirectory,
    docDirectory,
    config: rspressConfig,
  });
}
