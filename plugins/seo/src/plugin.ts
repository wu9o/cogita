import fs from 'node:fs';
import path from 'node:path';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import {
  type CogitaPluginConfig,
  type RspressPlugin,
  getBlogListRoutes,
  getCategoryRoutes,
} from '@cogita/shared';
import type { RouteMeta } from '@rspress/shared';
import { glob } from 'glob';
import { createSEOAuditReport, formatSEOAuditReport } from './audit';
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
  let auditReport: ReturnType<typeof createSEOAuditReport> | undefined;
  let auditOutputFile: string | undefined;

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
            finalConfig.defaultImageAlt,
            finalConfig.author,
            siteDescription,
            finalConfig.twitterCard
          ),
        ])
      );
      const defaultImage = finalConfig.defaultImage
        ? resolveSiteUrl(siteRoot, finalConfig.defaultImage)
        : undefined;
      const homeMeta: SEOPageMeta = {
        title: siteTitle,
        description: siteDescription,
        canonical: siteRoot ? resolveSiteUrl(siteRoot, '/') : undefined,
        image: defaultImage,
        imageAlt: finalConfig.defaultImageAlt,
        type: 'WebSite',
        robots: finalConfig.robots,
        twitterCard: finalConfig.twitterCard || (defaultImage ? 'summary_large_image' : 'summary'),
      };
      const blogListRoutes =
        config.blogList?.enabled !== false ? getBlogListRoutes(posts, config.blogList) : [];
      const blogListMeta = new Map(
        blogListRoutes.map((route) => {
          const isListPage = route === `/${config.blogList?.routePrefix || 'archive'}`;
          const isArchivePage = route.startsWith(
            `/${config.blogList?.archivePrefix || 'archives'}`
          );
          const title = isListPage
            ? `全部文章 - ${siteTitle}`
            : isArchivePage
              ? `时间归档 - ${siteTitle}`
              : `文章列表 - ${siteTitle}`;
          const meta: SEOPageMeta = {
            title,
            description: siteDescription,
            canonical: siteRoot ? resolveSiteUrl(siteRoot, route) : undefined,
            image: defaultImage,
            imageAlt: finalConfig.defaultImageAlt,
            type: 'WebSite',
            robots: finalConfig.robots,
            twitterCard:
              finalConfig.twitterCard || (defaultImage ? 'summary_large_image' : 'summary'),
          };
          return [normalizeRoute(route), meta] as const;
        })
      );
      const searchRoute =
        config.search?.enabled !== false && config.search
          ? `/${(config.search.routePrefix || 'search').replace(/^\/+|\/+$/g, '')}`
          : undefined;
      const searchMeta = searchRoute
        ? new Map([
            [
              normalizeRoute(searchRoute),
              {
                title: `搜索文章 - ${siteTitle}`,
                description: siteDescription,
                canonical: siteRoot ? resolveSiteUrl(siteRoot, searchRoute) : undefined,
                image: defaultImage,
                imageAlt: finalConfig.defaultImageAlt,
                type: 'WebSite' as const,
                robots: finalConfig.robots,
                twitterCard:
                  finalConfig.twitterCard || (defaultImage ? 'summary_large_image' : 'summary'),
              },
            ],
          ])
        : new Map();
      const categoryRoutes =
        config.categories?.enabled !== false && config.categories
          ? [
              `/${(config.categories.routePrefix || 'categories').replace(/^\/+|\/+$/g, '')}`,
              ...getCategoryRoutes(posts, config.categories),
            ]
          : [];
      const categoryMeta = new Map(
        categoryRoutes.map((route) => [
          normalizeRoute(route),
          {
            title: `文章分类 - ${siteTitle}`,
            description: siteDescription,
            canonical: siteRoot ? resolveSiteUrl(siteRoot, route) : undefined,
            image: defaultImage,
            imageAlt: finalConfig.defaultImageAlt,
            type: 'WebSite' as const,
            robots: finalConfig.robots,
            twitterCard:
              finalConfig.twitterCard || (defaultImage ? 'summary_large_image' : 'summary'),
          },
        ])
      );
      const pageMetaByRoute = new Map([
        ...postsByRoute,
        ...blogListMeta,
        ...searchMeta,
        ...categoryMeta,
      ]);

      if (finalConfig.audit?.enabled) {
        auditReport = createSEOAuditReport(
          [
            { route: '/', meta: homeMeta },
            ...Array.from(postsByRoute.entries()).map(([route, meta]) => ({ route, meta })),
            ...Array.from(blogListMeta.entries()).map(([route, meta]) => ({ route, meta })),
            ...Array.from(searchMeta.entries()).map(([route, meta]) => ({ route, meta })),
            ...Array.from(categoryMeta.entries()).map(([route, meta]) => ({ route, meta })),
          ],
          finalConfig.audit
        );
        console.log(formatSEOAuditReport(auditReport));

        if (finalConfig.audit.failOnError && auditReport.errors > 0) {
          throw new Error(`[SEO Plugin] 审核发现 ${auditReport.errors} 个错误，已根据配置阻断构建`);
        }

        const rspressConfigObject = rspressConfig as unknown as Record<string, unknown>;
        const configuredOutput = (rspressConfigObject.output as Record<string, unknown> | undefined)
          ?.path;
        const outputDir = path.resolve(
          config.cwd || process.cwd(),
          String(configuredOutput || 'doc_build')
        );
        if (finalConfig.audit.reportPath) {
          auditOutputFile = path.resolve(outputDir, finalConfig.audit.reportPath);
        }
      }

      const head = [
        ...(rspressConfig.head ?? []),
        (route: RouteMeta) => {
          const routeKey = normalizeRoute(route.routePath, config.site?.base);
          const pageMeta = pageMetaByRoute.get(routeKey);
          const isHome = isHomeRoute(route, config.site?.base);
          const canonical =
            pageMeta?.canonical || (siteRoot ? resolveSiteUrl(siteRoot, routeKey) : undefined);
          const meta: SEOPageMeta = pageMeta
            ? { ...pageMeta, canonical }
            : isHome
              ? homeMeta
              : {
                  title: route.pageName || siteTitle,
                  description: siteDescription,
                  canonical,
                  image: defaultImage,
                  imageAlt: finalConfig.defaultImageAlt,
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

    async afterBuild() {
      if (!auditReport || !auditOutputFile) {
        return;
      }

      fs.mkdirSync(path.dirname(auditOutputFile), { recursive: true });
      fs.writeFileSync(auditOutputFile, `${JSON.stringify(auditReport, null, 2)}\n`, 'utf8');
      console.log(`[SEO Plugin] 审核报告已写入: ${auditOutputFile}`);
    },
  };
}

export default pluginSEO;
