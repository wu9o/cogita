import type { RspressPlugin } from '@rspress/core';
import { glob } from 'glob';
import type { PluginOptions, PostFrontmatter } from './types';
import { getFrontmatterFromFile } from './utils';

export function pluginPostsFrontmatter(options: PluginOptions): RspressPlugin {
  const { postsDir, routePrefix = 'posts' } = options;
  // 用于在钩子之间传递数据的文章数据数组
  let allPostsData: PostFrontmatter[] = [];

  return {
    name: '@cogita/plugin-posts-frontmatter',

    async beforeBuild() {
      // 1. 使用 glob 扫描指定目录下的所有 .md 和 .mdx 文件
      const files = await glob(`${postsDir}/**/*.{md,mdx}`);

      // 2. 遍历所有文件，提取 frontmatter，并存入 allPostsData
      allPostsData = files
        .map((file) => getFrontmatterFromFile(file, postsDir, routePrefix))
        .filter(Boolean) as PostFrontmatter[]; // 过滤掉解析失败的 null 值

      // 3. 按创建日期降序排序
      allPostsData.sort(
        (a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
      );
    },

    addPages() {
      // 4. 遍历 allPostsData，为每篇文章添加一个页面路由
      return allPostsData.map((post) => ({
        routePath: post.route,
        absolutePath: post.filePath,
      }));
    },

    addRuntimeModules() {
      // 5. 创建一个虚拟模块，用于在客户端代码中访问所有文章的数据
      const virtualModuleId = 'virtual-posts-data';
      return {
        [virtualModuleId]: `export const allPosts = ${JSON.stringify(allPostsData)};`,
      };
    },
  };
}
