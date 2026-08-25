import fs from 'node:fs';
import path from 'node:path';
import {
  type CogitaPlugin,
  type CogitaPluginConfig,
  getBlogListRouteEntries,
  getCategoryRoutes,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';
import type { SitemapConfig, SitemapEntry, SitemapPost } from './types';
import {
  createPostEntries,
  createSiteRoot,
  deduplicateEntries,
  generateSitemapXml,
  normalizeLastmod,
  normalizeOutputPath,
  normalizePriority,
  resolveSitemapUrl,
} from './utils';

const DEFAULT_CONFIG: Required<
  Pick<
    SitemapConfig,
    | 'path'
    | 'includeHome'
    | 'includePosts'
    | 'includeBlogList'
    | 'includeSearch'
    | 'includeCategories'
    | 'changefreq'
    | 'priority'
  >
> = {
  path: 'sitemap.xml',
  includeHome: true,
  includePosts: true,
  includeBlogList: true,
  includeSearch: true,
  includeCategories: true,
  changefreq: 'weekly',
  priority: 0.7,
};

async function collectPosts(
  config: CogitaPluginConfig,
  logger: ReturnType<typeof getCogitaLogger>
): Promise<SitemapPost[]> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex) {
    return (await buildContext.contentIndex.getPosts()).map((post) => ({
      route: post.route,
      createDate: post.createDate,
      updateDate: post.updateDate,
      categories: post.categories,
    }));
  }

  logger.warn('[Sitemap Plugin] 未找到共享内容索引，跳过文章路由收集');
  return [];
}

function resolveCustomEntries(
  siteRoot: string,
  customUrls: SitemapConfig['customUrls']
): SitemapEntry[] {
  return (customUrls ?? []).map((customUrl) => ({
    loc: resolveSitemapUrl(siteRoot, customUrl.path),
    lastmod: normalizeLastmod(customUrl.lastmod),
    changefreq: customUrl.changefreq,
    priority: normalizePriority(customUrl.priority),
  }));
}

/** 创建构建期 XML 站点地图插件。 */
export function pluginSitemap(config: CogitaPluginConfig): CogitaPlugin | null {
  const sitemapConfig = config.sitemap as SitemapConfig | undefined;
  if (!sitemapConfig || sitemapConfig.enabled === false) {
    return null;
  }

  const buildContext = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...sitemapConfig,
  };
  let entries: SitemapEntry[] = [];
  let outputFile: string | undefined;

  return {
    name: '@cogita/plugin-sitemap',
    cogita: {
      providesCapabilities: ['seo.sitemap'],
    },

    async beforeBuild(rspressConfig: unknown) {
      const siteUrl = config.site?.url;
      if (!siteUrl) {
        const message = '[Sitemap Plugin] 缺少 site.url，无法生成站点地图';
        const shouldFail = finalConfig.failOnMissingSiteUrl ?? buildContext.strict !== false;
        if (shouldFail) {
          throw new Error(message);
        }

        logger.warn(`${message}，已跳过`);
        entries = [];
        return;
      }

      const siteRoot = createSiteRoot(siteUrl, config.site?.base);
      const sitemapEntries: SitemapEntry[] = [];

      if (finalConfig.includeHome) {
        sitemapEntries.push({
          loc: resolveSitemapUrl(siteRoot, '/'),
          changefreq: finalConfig.changefreq,
          priority: normalizePriority(finalConfig.priority),
        });
      }

      const posts =
        finalConfig.includePosts || finalConfig.includeBlogList
          ? await collectPosts(config, logger)
          : [];

      if (finalConfig.includePosts) {
        sitemapEntries.push(
          ...createPostEntries(siteRoot, posts, finalConfig.changefreq, finalConfig.priority)
        );
      }

      if (
        finalConfig.includeBlogList &&
        config.blogList?.enabled !== false &&
        buildContext.themeLayouts?.blogList
      ) {
        sitemapEntries.push(
          ...getBlogListRouteEntries(posts, {
            ...config.blogList,
            categorySeparator: config.categories?.separator,
          })
            .filter(
              (entry) => entry.kind !== 'archive' || Boolean(buildContext.themeLayouts?.archive)
            )
            .map((entry) => ({
              loc: resolveSitemapUrl(siteRoot, entry.route),
              changefreq: finalConfig.changefreq,
              priority: normalizePriority(finalConfig.priority),
            }))
        );
      }

      if (
        finalConfig.includeSearch &&
        config.search?.enabled !== false &&
        config.search &&
        buildContext.themeLayouts?.search
      ) {
        const routePrefix = (config.search.routePrefix || 'search').replace(/^\/+|\/+$/g, '');
        sitemapEntries.push({
          loc: resolveSitemapUrl(siteRoot, `/${routePrefix}`),
          changefreq: finalConfig.changefreq,
          priority: normalizePriority(finalConfig.priority),
        });
      }

      if (
        finalConfig.includeCategories &&
        config.categories?.enabled !== false &&
        config.categories &&
        buildContext.themeLayouts?.category
      ) {
        const categoryPrefix = (config.categories.routePrefix || 'categories').replace(
          /^\/+|\/+$/g,
          ''
        );
        sitemapEntries.push({
          loc: resolveSitemapUrl(siteRoot, `/${categoryPrefix}`),
          changefreq: finalConfig.changefreq,
          priority: normalizePriority(finalConfig.priority),
        });
        sitemapEntries.push(
          ...getCategoryRoutes(posts, config.categories).map((route) => ({
            loc: resolveSitemapUrl(siteRoot, route),
            changefreq: finalConfig.changefreq,
            priority: normalizePriority(finalConfig.priority),
          }))
        );
      }

      sitemapEntries.push(...resolveCustomEntries(siteRoot, finalConfig.customUrls));
      entries = deduplicateEntries(sitemapEntries);

      const rspressConfigObject = rspressConfig as Record<string, unknown>;
      const configuredOutput = (rspressConfigObject.output as Record<string, unknown> | undefined)
        ?.path;
      const outputDir = path.resolve(
        buildContext.cwd || process.cwd(),
        String(configuredOutput || 'doc_build')
      );
      outputFile = path.join(outputDir, normalizeOutputPath(finalConfig.path));
      logger.info(`[Sitemap Plugin] 已收集 ${entries.length} 个站点地址`);
    },

    async afterBuild() {
      if (!outputFile || entries.length === 0) {
        logger.warn('[Sitemap Plugin] 没有可输出的站点地址，跳过 sitemap.xml 生成');
        return;
      }

      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, generateSitemapXml(entries), 'utf8');
      logger.info(`[Sitemap Plugin] 站点地图已写入: ${outputFile}`);
    },
  };
}

export default pluginSitemap;
