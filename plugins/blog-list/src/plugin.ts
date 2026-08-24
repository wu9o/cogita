import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPlugin, CogitaPluginConfig } from '@cogita/shared';
import type { BlogArchive, BlogListFilter, BlogListPage } from './types';
import {
  buildArchives,
  buildFilters,
  extractPosts,
  filterPosts,
  paginatePosts,
  resolveBlogListConfig,
  sortPosts,
} from './utils';

/** 创建文章列表与归档插件。 */
export function pluginBlogList(config: CogitaPluginConfig): CogitaPlugin | null {
  const logger = getCogitaLogger(config);
  const blogListConfig = config.blogList;

  if (!blogListConfig || blogListConfig.enabled === false) {
    logger.info('[Blog List Plugin] Blog list 配置未启用，跳过文章列表功能');
    return null;
  }

  const buildContext = getCogitaBuildContext(config);

  const finalConfig = resolveBlogListConfig(blogListConfig);
  let pages: BlogListPage[] = [];
  let archives: BlogArchive[] = [];
  let filters: BlogListFilter[] = [];

  return {
    name: '@cogita/plugin-blog-list',
    cogita: {
      requiredLayouts: [
        { layout: 'blogList', label: '文章列表' },
        {
          layout: 'archive',
          label: '归档',
          when: (pluginConfig: CogitaPluginConfig) =>
            pluginConfig.blogList?.generateArchives === true,
        },
      ],
    },

    async beforeBuild() {
      const postsConfig = config.posts || {};
      const posts = await extractPosts(
        postsConfig.dir || 'posts',
        buildContext.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx'],
        buildContext.contentIndex,
        logger
      );
      const sortedPosts = sortPosts(posts, finalConfig);

      const categorySeparator = config.categories?.separator || '/';
      filters = buildFilters(sortedPosts, finalConfig, categorySeparator);
      pages = [
        ...paginatePosts(sortedPosts, finalConfig),
        ...filters.flatMap((filter) =>
          paginatePosts(filterPosts(sortedPosts, filter, categorySeparator), finalConfig, filter)
        ),
      ];
      if (finalConfig.generateArchives) {
        const archiveResult = buildArchives(sortedPosts, finalConfig);
        archives = archiveResult.archives;
        if (archiveResult.invalidDateCount > 0) {
          logger.warn(
            `[Blog List Plugin] 有 ${archiveResult.invalidDateCount} 篇文章的 createDate 无法生成归档，已跳过归档分组`
          );
        }
      } else {
        archives = [];
      }

      logger.info(
        `[Blog List Plugin] 已生成 ${pages.length} 个列表页、${filters.length} 个筛选项和 ${archives.length > 0 ? archives.length + 1 : 0} 个归档页`
      );
    },

    addPages() {
      const listLayout = buildContext.themeLayouts?.blogList;
      const archiveLayout = buildContext.themeLayouts?.archive;
      const result = [];

      if (listLayout) {
        result.push(
          ...pages.map((page) => ({
            routePath: page.route,
            content: '---\npageType: blogList\nsidebar: false\n---',
            filepath: listLayout,
          }))
        );
      } else {
        logger.warn('[Blog List Plugin] 主题未提供 pageLayouts.blogList，跳过文章列表页面生成');
      }

      if (finalConfig.generateArchives && archiveLayout) {
        result.push(
          ...(archives.length > 0
            ? [
                {
                  routePath: `/${finalConfig.archivePrefix}`,
                  content: '---\npageType: archive\nsidebar: false\n---',
                  filepath: archiveLayout,
                },
              ]
            : []),
          ...archives.map((archive) => ({
            routePath: archive.route,
            content: '---\npageType: archive\nsidebar: false\n---',
            filepath: archiveLayout,
          }))
        );
      } else if (finalConfig.generateArchives && archives.length > 0) {
        logger.warn('[Blog List Plugin] 主题未提供 pageLayouts.archive，跳过文章归档页面生成');
      }

      return result;
    },

    addRuntimeModules() {
      return {
        'virtual-blog-list-data': `
          export const blogListConfig = ${JSON.stringify(finalConfig)};
          export const allBlogListPages = ${JSON.stringify(pages)};
          export const allBlogListFilters = ${JSON.stringify(filters)};
          export const allArchives = ${JSON.stringify(archives)};

          export function getBlogListPage(page, filterKey = 'all') {
            return allBlogListPages.find(item => item.page === page && (item.filter?.key || 'all') === filterKey);
          }

          export function getBlogListFilter(key) {
            return allBlogListFilters.find(item => item.key === key);
          }

          export function getArchive(key) {
            return allArchives.find(item => item.key === key);
          }
        `,
      };
    },
  };
}

export default pluginBlogList;
