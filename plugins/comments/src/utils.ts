import path from 'node:path';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import { createCogitaLogger } from '@cogita/shared';
import type { CogitaLogger, ContentIndex } from '@cogita/shared';
import { glob } from 'glob';
import type {
  CommentsConfig,
  GiscusConfig,
  ResolvedCommentsConfig,
  ResolvedGiscusConfig,
  ResolvedUtterancesConfig,
  UtterancesConfig,
} from './types';

/** 规范化 Giscus 配置。 */
function resolveGiscusConfig(config?: GiscusConfig): ResolvedGiscusConfig {
  return {
    repo: config?.repo || '',
    repoId: config?.repoId || '',
    category: config?.category || '',
    categoryId: config?.categoryId || '',
    mapping: config?.mapping || 'pathname',
    term: config?.term || '',
    strict: config?.strict === true,
    reactionsEnabled: config?.reactionsEnabled !== false,
    emitMetadata: config?.emitMetadata === true,
    inputPosition: config?.inputPosition || 'bottom',
    theme: config?.theme || 'preferred_color_scheme',
    lang: config?.lang || 'zh-CN',
    loading: config?.loading || 'lazy',
  };
}

/** 规范化 Utterances 配置。 */
function resolveUtterancesConfig(config?: UtterancesConfig): ResolvedUtterancesConfig {
  return {
    repo: config?.repo || '',
    issueTerm: config?.issueTerm || 'pathname',
    term: config?.term || '',
    label: config?.label || '',
    theme: config?.theme || 'github-light',
  };
}

/** 规范化评论插件配置。 */
export function resolveCommentsConfig(
  config?: CommentsConfig,
  postRoutes: string[] = []
): ResolvedCommentsConfig {
  return {
    enabled: config?.enabled === true,
    provider: config?.provider === 'utterances' ? 'utterances' : 'giscus',
    title: config?.title || '评论',
    giscus: resolveGiscusConfig(config?.giscus),
    utterances: resolveUtterancesConfig(config?.utterances),
    postRoutes: [...new Set(postRoutes)].sort(),
  };
}

/** 检查已启用评论配置是否具备提供商所需字段。 */
export function validateCommentsConfig(config: ResolvedCommentsConfig): string | null {
  if (!config.enabled) return null;

  if (config.provider === 'giscus') {
    const missing = [
      ['comments.giscus.repo', config.giscus.repo],
      ['comments.giscus.repoId', config.giscus.repoId],
      ['comments.giscus.category', config.giscus.category],
      ['comments.giscus.categoryId', config.giscus.categoryId],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (config.giscus.mapping === 'specific' && !config.giscus.term) {
      missing.push('comments.giscus.term');
    }

    return missing.length > 0 ? `Giscus 缺少必填配置：${missing.join('、')}` : null;
  }

  if (!config.utterances.repo) {
    return 'Utterances 缺少必填配置：comments.utterances.repo';
  }

  if (config.utterances.issueTerm === 'specific' && !config.utterances.term) {
    return 'Utterances 使用 specific 映射时必须配置 comments.utterances.term';
  }

  return null;
}

/** 扫描文章路由，供主题判断评论组件是否应挂载。 */
export async function extractCommentPostRoutes(
  postsDir: string,
  cwd: string,
  routePrefix: string,
  extensions: string[],
  contentIndex?: ContentIndex,
  logger: CogitaLogger = createCogitaLogger()
): Promise<string[]> {
  if (contentIndex) {
    return (await contentIndex.getPosts()).map((post) => post.route).sort();
  }

  const normalizedExtensions = extensions.length > 0 ? extensions : ['md', 'mdx'];
  const extensionPattern =
    normalizedExtensions.length > 1
      ? `{${normalizedExtensions.join(',')}}`
      : normalizedExtensions[0];
  const absolutePostsDir = path.resolve(cwd, postsDir);
  const absolutePaths = await glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd,
    nodir: true,
  });

  return absolutePaths
    .map((filePath) => {
      try {
        return (
          getFrontmatterFromFile(filePath, absolutePostsDir, routePrefix, logger)?.route || null
        );
      } catch (error) {
        logger.warn(`[Comments Plugin] 跳过文件 ${filePath}:`, error);
        return null;
      }
    })
    .filter((route): route is string => route !== null)
    .sort();
}
