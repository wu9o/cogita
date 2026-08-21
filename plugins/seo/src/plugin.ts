import path from 'node:path';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import type { CogitaPluginConfig, RspressPlugin } from '@cogita/shared';
import type { RouteMeta } from '@rspress/shared';
import { glob } from 'glob';
import type { SEOConfig, SEOPageMeta } from './types';
import {
  createPostMeta,
  createSiteRoot,
  escapeHtml,
  isHomeRoute,
  normalizeRoute,
  renderSeoHead,
  resolveSiteUrl,
} from './utils';

const DEFAULT_CONFIG: Required<Pick<SEOConfig, 'robots' | 'includeJsonLd'>> = {
  robots: 'index, follow',
  includeJsonLd: true,
};

async function collectPosts(config: CogitaPluginConfig) {
  const postsConfig = config.posts ?? {};
  const cwd = config.cwd || process.cwd();
  const postsDir = postsConfig.dir || 'posts';
  const absolutePostsDir = path.resolve(cwd, postsDir);
  const routePrefix = postsConfig.routePrefix || 'posts';
  const extensions = postsConfig.extensions?.length ? postsConfig.extensions : ['md', 'mdx'];
  const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];
  const absolutePaths = await glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd,
    nodir: true,
  });

  return absolutePaths
    .map((filePath) => getFrontmatterFromFile(filePath, absolutePostsDir, routePrefix))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));
}

/** 创建构建期页面 SEO 元数据插件。 */
export function pluginSEO(config: CogitaPluginConfig): RspressPlugin | null {
  const seoConfig = config.seo as SEOConfig | undefined;
  if (!seoConfig || seoConfig.enabled === false) {
    return null;
  }

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...seoConfig,
  };

  return {
    name: '@cogita/plugin-seo',

    async config(rspressConfig) {
      let posts = [] as Awaited<ReturnType<typeof collectPosts>>;
      try {
        posts = await collectPosts(config);
      } catch (error) {
        const message = `[SEO Plugin] 扫描文章失败: ${error instanceof Error ? error.message : String(error)}`;
        if (config.strict !== false) {
          throw new Error(message);
        }
        console.warn(`${message}，将只生成站点级元数据`);
      }

      const siteTitle = config.site?.title || 'Cogita Blog';
      const siteDescription =
        finalConfig.defaultDescription || config.site?.description || 'A blog powered by Cogita';
      const siteRoot = createSiteRoot(config.site?.url, config.site?.base);
      const postsByRoute = new Map(
        posts.map((post) => [
          normalizeRoute(post.route),
          createPostMeta(
            post,
            siteRoot,
            finalConfig.defaultImage,
            finalConfig.author,
            siteDescription,
            finalConfig.twitterCard
          ),
        ])
      );
      const defaultImage = finalConfig.defaultImage
        ? resolveSiteUrl(siteRoot, finalConfig.defaultImage)
        : undefined;

      const head = [
        ...(rspressConfig.head ?? []),
        (route: RouteMeta) => {
          const routeKey = normalizeRoute(route.routePath, config.site?.base);
          const postMeta = postsByRoute.get(routeKey);
          const isHome = isHomeRoute(route, config.site?.base);
          const canonical =
            postMeta?.canonical || (siteRoot ? resolveSiteUrl(siteRoot, routeKey) : undefined);
          const meta: SEOPageMeta = postMeta
            ? { ...postMeta, canonical }
            : {
                title: isHome ? siteTitle : route.pageName || siteTitle,
                description: siteDescription,
                canonical,
                image: defaultImage,
                type: 'WebSite',
                robots: finalConfig.robots,
                twitterCard:
                  finalConfig.twitterCard || (defaultImage ? 'summary_large_image' : 'summary'),
              };

          const rendered = renderSeoHead(meta, finalConfig.includeJsonLd);
          const twitterSite = finalConfig.twitterSite
            ? `<meta name="twitter:site" content="${escapeHtml(finalConfig.twitterSite)}" />`
            : '';
          const twitterCreator = finalConfig.twitterCreator
            ? `<meta name="twitter:creator" content="${escapeHtml(finalConfig.twitterCreator)}" />`
            : '';
          return `${rendered}${twitterSite}${twitterCreator}`;
        },
      ];

      return {
        ...rspressConfig,
        // Rspress 的全局 description 只支持一个静态值，由插件 head 提供页面级描述。
        description: '',
        head,
      };
    },
  };
}

export default pluginSEO;
