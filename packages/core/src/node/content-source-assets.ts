import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { VIRTUAL_CONTENT_DIR, getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type {
  CogitaPlugin,
  CogitaPluginConfig,
  ContentSourceAsset,
  ContentSourceContext,
} from '@cogita/shared';

const EXTERNAL_ASSET_ROOT = 'external-content';

function resolvePublicAssetPath(publicRoot: string, publicPath: string): string {
  const normalizedPath = publicPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const targetPath = path.resolve(publicRoot, normalizedPath);
  const normalizedRoot = path.resolve(publicRoot);
  if (
    !normalizedPath ||
    normalizedPath === '.' ||
    normalizedPath.startsWith('../') ||
    path.isAbsolute(publicPath) ||
    (targetPath !== normalizedRoot && !targetPath.startsWith(`${normalizedRoot}${path.sep}`))
  ) {
    throw new Error(`[Cogita] 外部内容源资源路径无效：${publicPath}`);
  }
  return targetPath;
}

async function copyExternalAssets(
  publicRoot: string,
  assets: readonly ContentSourceAsset[],
  sourceId: string
): Promise<number> {
  let copiedCount = 0;
  for (const asset of assets) {
    if (!asset || typeof asset.filePath !== 'string' || typeof asset.publicPath !== 'string') {
      throw new Error(`[Cogita] 内容源 ${sourceId} 返回了无效资源描述`);
    }
    const targetPath = resolvePublicAssetPath(publicRoot, asset.publicPath);
    await stat(asset.filePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(asset.filePath, targetPath);
    copiedCount += 1;
  }
  return copiedCount;
}

async function getSourceAssets(
  sources: readonly NonNullable<CogitaPluginConfig['contentSources']>[number][],
  context: ContentSourceContext
): Promise<ContentSourceAsset[]> {
  const assets: ContentSourceAsset[] = [];
  for (const source of sources) {
    if (!source.getAssets) {
      continue;
    }
    const sourceAssets = await source.getAssets(context);
    if (!Array.isArray(sourceAssets)) {
      throw new Error(`[Cogita] 内容源 ${source.id} 的 getAssets 必须返回资源数组`);
    }
    assets.push(...sourceAssets);
  }
  return assets;
}

/** 将外部内容源声明的资源复制到虚拟文档目录的公共资源区。 */
export function createContentSourceAssetsPlugin(config: CogitaPluginConfig): CogitaPlugin {
  const buildContext = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);
  const sources = config.contentSources || [];
  const sourceContext: ContentSourceContext = {
    root: buildContext.root,
    cwd: buildContext.cwd,
    logger,
  };

  return {
    name: 'cogita-content-source-assets',

    async beforeBuild() {
      const publicRoot = path.resolve(buildContext.root, VIRTUAL_CONTENT_DIR, 'public');
      const externalAssetRoot = path.join(publicRoot, EXTERNAL_ASSET_ROOT);
      await rm(externalAssetRoot, { recursive: true, force: true });

      const assets = await getSourceAssets(sources, sourceContext);
      const copiedCount = await copyExternalAssets(publicRoot, assets, '外部内容源');

      if (copiedCount > 0) {
        logger.info(`[Cogita] 已发布 ${copiedCount} 个外部内容源静态资源`);
      }
    },

    async afterBuild(rspressConfig, isProd) {
      if (!isProd) {
        return;
      }
      const outputRoot = path.resolve(
        rspressConfig.root || buildContext.root,
        rspressConfig.outDir || 'doc_build'
      );
      const externalAssetRoot = path.join(outputRoot, EXTERNAL_ASSET_ROOT);
      await rm(externalAssetRoot, { recursive: true, force: true });
      const assets = await getSourceAssets(sources, sourceContext);
      await copyExternalAssets(outputRoot, assets, '外部内容源');
    },
  };
}
