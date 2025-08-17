import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { PostFrontmatter } from './types';

/**
 * 读取并解析单个文件的 Frontmatter 信息，并结合文件系统信息进行丰富。
 * @param filePath 文件的绝对路径。
 * @param postsDir 文章的根目录路径，用于计算路由。
 * @param routePrefix 路由前缀，例如 'blog'。
 * @returns 结构化的 Frontmatter 对象，如果发生错误或文件类型不支持则返回 null。
 */
export function getFrontmatterFromFile(
  filePath: string,
  postsDir: string,
  routePrefix = 'posts'
): PostFrontmatter | null {
  try {
    const fileExt = path.extname(filePath);
    if (!['.md', '.mdx'].includes(fileExt)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const { data: frontmatter } = matter(fileContent);

    const relativePath = path.relative(postsDir, filePath);
    const routeWithoutExt = relativePath.replace(/\.(mdx?)$/, '');
    const baseRoute = routeWithoutExt.replace(/(^|\/)index$/, '');
    // 使用 path.join 来安全地组合路由，并确保有前导斜杠
    const route = `/${path.join(routePrefix, baseRoute)}`.replace(/\\/g, '/');

    const title = frontmatter.title || path.basename(filePath, fileExt);

    return {
      title: title,
      description: frontmatter.description,
      filePath: filePath,
      route: route,
      createDate: frontmatter.date || frontmatter.createDate || stats.birthtime.toISOString(),
      updateDate: frontmatter.updateDate || stats.mtime.toISOString(),
      categories: frontmatter.categories,
      tags: frontmatter.tags,
    };
  } catch (e) {
    console.error(`从 ${filePath} 读取 frontmatter 时出错:`, e);
    return null;
  }
}
