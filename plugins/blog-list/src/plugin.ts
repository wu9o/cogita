import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import type { BlogArchive, BlogListPage } from './types';
import {
  buildArchives,
  extractPosts,
  paginatePosts,
  resolveBlogListConfig,
  sortPosts,
} from './utils';

/** 创建文章列表与归档插件。 */
export function pluginBlogList(config: CogitaPluginConfig): RspressPlugin | null {
  const blogListConfig = config.blogList;

  if (!blogListConfig || blogListConfig.enabled === false) {
    console.log('[Blog List Plugin] Blog list 配置未启用，跳过文章列表功能');
    return null;
  }

  const finalConfig = resolveBlogListConfig(blogListConfig);
  let pages: BlogListPage[] = [];
  let archives: BlogArchive[] = [];

  return {
    name: '@cogita/plugin-blog-list',

    async beforeBuild() {
      const postsConfig = config.posts || {};
      const posts = await extractPosts(
        postsConfig.dir || 'posts',
        config.cwd || process.cwd(),
        postsConfig.routePrefix || 'posts',
        postsConfig.extensions || ['md', 'mdx']
      );
      const sortedPosts = sortPosts(posts, finalConfig);

      pages = paginatePosts(sortedPosts, finalConfig);
      if (finalConfig.generateArchives) {
        const archiveResult = buildArchives(sortedPosts, finalConfig);
        archives = archiveResult.archives;
        if (archiveResult.invalidDateCount > 0) {
          console.warn(
            `[Blog List Plugin] 有 ${archiveResult.invalidDateCount} 篇文章的 createDate 无法生成归档，已跳过归档分组`
          );
        }
      } else {
        archives = [];
      }

      console.log(
        `[Blog List Plugin] 已生成 ${pages.length} 个列表页和 ${archives.length > 0 ? archives.length + 1 : 0} 个归档页`
      );
    },

    addPages() {
      const listLayout = config.themeLayouts?.blogList;
      const archiveLayout = config.themeLayouts?.archive;
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
        console.warn('[Blog List Plugin] 主题未提供 pageLayouts.blogList，跳过文章列表页面生成');
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
        console.warn('[Blog List Plugin] 主题未提供 pageLayouts.archive，跳过文章归档页面生成');
      }

      return result;
    },

    addRuntimeModules() {
      return {
        'virtual-blog-list-data': `
          export const blogListConfig = ${JSON.stringify(finalConfig)};
          export const allBlogListPages = ${JSON.stringify(pages)};
          export const allArchives = ${JSON.stringify(archives)};

          export function getBlogListPage(page) {
            return allBlogListPages.find(item => item.page === page);
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
