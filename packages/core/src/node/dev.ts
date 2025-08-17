import path from 'node:path';
import { VIRTUAL_CONTENT_DIR } from '@cogita/shared';
import { dev } from '@rspress/core';
import { createRspressConfig, loadCogitaConfig } from './config';

export async function createServer(root: string = process.cwd()): Promise<void> {
  const cogitaConfig = await loadCogitaConfig(root);
  const rspressConfig = await createRspressConfig(cogitaConfig, root);

  // The `appDirectory` should be the user's project root.
  const appDirectory = root;
  // The `docDirectory` should be a non-existent directory to prevent
  // Rspress's file-based routing from conflicting with our dynamic pages.
  const docDirectory = path.join(root, VIRTUAL_CONTENT_DIR);

  await dev({
    appDirectory,
    docDirectory,
    config: rspressConfig,
  });
}
