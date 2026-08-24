import path from 'node:path';
import { VIRTUAL_CONTENT_DIR } from '@cogita/shared';
import { dev } from '@rspress/core';
import chokidar from 'chokidar';
import { findUp } from 'find-up';
import type { CogitaConfig } from '../types';
import { createRspressConfig, loadCogitaConfig, prepareSiteIcon } from './config';

const CONFIG_FILES = ['cogita.config.ts', 'cogita.config.js', 'cogita.config.mjs'];

/** 返回开发服务器需要触发完整重建的项目路径。 */
export function getDevWatchPaths(
  root: string,
  config: CogitaConfig,
  configPath?: string
): string[] {
  return [
    path.resolve(root, config.posts?.dir || 'posts'),
    path.resolve(root, 'public'),
    configPath,
  ].filter((item): item is string => Boolean(item));
}

type DevServer = Awaited<ReturnType<typeof dev>>;

/** 创建一次 Rspress 开发服务器实例。 */
async function startServer(root: string, cogitaConfig: CogitaConfig): Promise<DevServer> {
  const rspressConfig = await createRspressConfig(cogitaConfig, root);

  // appDirectory 使用用户项目根目录。
  const appDirectory = root;
  // docDirectory 使用虚拟目录，避免 Rspress 文件路由与动态页面冲突。
  const docDirectory = path.join(root, VIRTUAL_CONTENT_DIR);

  await prepareSiteIcon(root, docDirectory, cogitaConfig.site?.icon);
  return dev({
    appDirectory,
    docDirectory,
    config: rspressConfig,
  });
}

export async function createServer(root: string = process.cwd()): Promise<void> {
  let activeConfig = await loadCogitaConfig(root);
  const initialConfigPath = await findUp(CONFIG_FILES, { cwd: root, type: 'file' });
  let server = await startServer(root, activeConfig);
  let watchedPaths = getDevWatchPaths(root, activeConfig, initialConfigPath);
  let restartPromise: Promise<void> | undefined;
  let pendingFilePath: string | undefined;

  const restart = async () => {
    if (restartPromise) {
      return restartPromise;
    }

    restartPromise = (async () => {
      do {
        const changedFilePath = pendingFilePath;
        pendingFilePath = undefined;

        // 等待编辑器完成原子写入，避免读取到半截配置或文章。
        await new Promise((resolve) => setTimeout(resolve, 80));
        const nextConfig = await loadCogitaConfig(root);
        const nextConfigPath = await findUp(CONFIG_FILES, { cwd: root, type: 'file' });
        const nextWatchPaths = getDevWatchPaths(root, nextConfig, nextConfigPath);

        // 先创建并校验新配置，失败时保留旧服务器继续提供预览。
        const nextRspressConfig = await createRspressConfig(nextConfig, root);
        const docDirectory = path.join(root, VIRTUAL_CONTENT_DIR);
        await prepareSiteIcon(root, docDirectory, nextConfig.site?.icon);

        console.log(
          `[Cogita] ${changedFilePath ? `${path.basename(changedFilePath)} 发生变化，` : ''}正在重建开发服务器`
        );
        const previousConfig = activeConfig;
        await server.close();
        try {
          server = await dev({
            appDirectory: root,
            docDirectory,
            config: nextRspressConfig,
          });
          activeConfig = nextConfig;
        } catch (error) {
          server = await startServer(root, previousConfig);
          throw error;
        }
        await watcher.unwatch(watchedPaths.filter((item) => !nextWatchPaths.includes(item)));
        await watcher.add(nextWatchPaths);
        watchedPaths = nextWatchPaths;
      } while (pendingFilePath);
    })()
      .catch((error) => {
        console.error('[Cogita] 开发服务器重建失败，保留当前服务器:', error);
      })
      .finally(() => {
        restartPromise = undefined;
      });

    return restartPromise;
  };

  const watcher = chokidar.watch(watchedPaths, {
    ignoreInitial: true,
    ignorePermissionErrors: true,
  });
  const handleChange = (filePath: string) => {
    pendingFilePath = filePath;
    void restart();
  };
  watcher.on('add', handleChange).on('change', handleChange).on('unlink', handleChange);
}
