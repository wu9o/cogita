import type { RspressPlugin } from '@rspress/core';
import { glob } from 'glob';
import type { PostFrontmatter } from './types';
import { getFrontmatterFromFile } from './utils';

export function pluginPostsFrontmatter(config: Record<string, any>): RspressPlugin {
  const postsDir = config.postsDir || 'posts';
  const cwd = config.cwd;
  const routePrefix = config.routePrefix || 'posts';
  // 用于在钩子之间传递数据的文章数据数组
  let allPostsData: PostFrontmatter[] = [];

  return {
    name: '@cogita/plugin-posts-frontmatter',

    async beforeBuild() {
      // 配置 glob 选项：获取绝对路径，并指定相对路径的基准目录
      const options = {
        absolute: true, // 返回绝对路径
        cwd, // 相对路径的基准目录（相对于 postsDir）
        nodir: true, // 只返回文件，不返回目录
      };

      // 执行 glob 匹配，获取绝对路径列表
      const absolutePaths = await glob(`${postsDir}/**/*.{md,mdx}`, options);

      // 2. 遍历所有文件，提取 frontmatter，并存入 allPostsData
      allPostsData = absolutePaths
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
        content: '---npageType: homen---',
        filepath: post.filePath,
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
