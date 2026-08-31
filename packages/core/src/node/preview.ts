import { serve } from '@rspress/core';
import { createRspressConfig, loadCogitaConfig } from './config';

/**
 * 预览构建产物
 * @param root 项目根目录
 * @param port 预览端口
 */
export async function createPreview(root: string, port?: number): Promise<void> {
  const cogitaConfig = await loadCogitaConfig(root, { required: true });
  const rspressConfig = await createRspressConfig(cogitaConfig, root);

  await serve({
    config: rspressConfig,
    port,
  });
}
