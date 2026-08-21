import fs from 'node:fs';
import path from 'node:path';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import type { CogitaPluginConfig, RspressPlugin } from '@cogita/shared';
import { glob } from 'glob';
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
  Pick<SitemapConfig, 'path' | 'includeHome' | 'includePosts' | 'changefreq' | 'priority'>
> = {
  path: 'sitemap.xml',
  includeHome: true,
  includePosts: true,
  changefreq: 'weekly',
  priority: 0.7,
};

function getPostGlob(postsDir: string, extensions: string[]): string {
  const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];
  return `${postsDir}/**/*.${extensionPattern}`;
}

async function collectPosts(config: CogitaPluginConfig): Promise<SitemapPost[]> {
  const postsConfig = config.posts ?? {};
  const cwd = config.cwd || process.cwd();
  const postsDir = postsConfig.dir || 'posts';
  const absolutePostsDir = path.resolve(cwd, postsDir);
  const routePrefix = postsConfig.routePrefix || 'posts';
  const extensions = postsConfig.extensions?.length ? postsConfig.extensions : ['md', 'mdx'];
  const absolutePaths = await glob(getPostGlob(postsDir, extensions), {
    absolute: true,
    cwd,
    nodir: true,
  });

  return absolutePaths
    .map((filePath) => getFrontmatterFromFile(filePath, absolutePostsDir, routePrefix))
    .filter((post): post is NonNullable<typeof post> => Boolean(post))
    .map((post) => ({
      route: post.route,
      updateDate: post.updateDate,
    }));
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
export function pluginSitemap(config: CogitaPluginConfig): RspressPlugin | null {
  const sitemapConfig = config.sitemap as SitemapConfig | undefined;
  if (!sitemapConfig || sitemapConfig.enabled === false) {
    return null;
  }

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...sitemapConfig,
  };
  let entries: SitemapEntry[] = [];
  let outputFile: string | undefined;

  return {
    name: '@cogita/plugin-sitemap',

    async beforeBuild(rspressConfig: unknown) {
      const siteUrl = config.site?.url;
      if (!siteUrl) {
        const message = '[Sitemap Plugin] 缺少 site.url，无法生成站点地图';
        const shouldFail = finalConfig.failOnMissingSiteUrl ?? config.strict !== false;
        if (shouldFail) {
          throw new Error(message);
        }

        console.warn(`${message}，已跳过`);
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

      if (finalConfig.includePosts) {
        const posts = await collectPosts(config);
        sitemapEntries.push(
          ...createPostEntries(siteRoot, posts, finalConfig.changefreq, finalConfig.priority)
        );
      }

      sitemapEntries.push(...resolveCustomEntries(siteRoot, finalConfig.customUrls));
      entries = deduplicateEntries(sitemapEntries);

      const rspressConfigObject = rspressConfig as Record<string, unknown>;
      const configuredOutput = (rspressConfigObject.output as Record<string, unknown> | undefined)
        ?.path;
      const outputDir = path.resolve(
        config.cwd || process.cwd(),
        String(configuredOutput || 'doc_build')
      );
      outputFile = path.join(outputDir, normalizeOutputPath(finalConfig.path));
      console.log(`[Sitemap Plugin] 已收集 ${entries.length} 个站点地址`);
    },

    async afterBuild() {
      if (!outputFile || entries.length === 0) {
        console.warn('[Sitemap Plugin] 没有可输出的站点地址，跳过 sitemap.xml 生成');
        return;
      }

      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, generateSitemapXml(entries), 'utf8');
      console.log(`[Sitemap Plugin] 站点地图已写入: ${outputFile}`);
    },
  };
}

export default pluginSitemap;
