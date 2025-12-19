import { glob } from 'glob';
import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import type { TagData, TagsConfig, PostReference, TagStats } from './types';

/**
 * 从文章中提取标签信息
 * @param postsDir 文章目录
 * @param cwd 当前工作目录
 * @param routePrefix 路由前缀
 * @returns 文章数据数组
 */
export async function extractTagsFromPosts(
  postsDir: string, 
  cwd: string, 
  routePrefix: string = 'posts'
) {
  const options = {
    absolute: true,
    cwd,
    nodir: true,
  };
  
  const absolutePaths = await glob(`${postsDir}/**/*.{md,mdx}`, options);
  
  return absolutePaths
    .map((filePath) => {
      try {
        return getFrontmatterFromFile(filePath, postsDir, routePrefix);
      } catch (error) {
        console.warn(`[Tags Plugin] 跳过文件 ${filePath}:`, error);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * 生成 URL 友好的标签 slug
 * @param tagName 标签名称
 * @returns URL slug
 */
export function generateTagSlug(tagName: string): string {
  return tagName
    .toLowerCase()
    .trim()
    // 支持中文字符，将非字母数字和中文字符替换为连字符
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    // 移除首尾连字符
    .replace(/^-+|-+$/g, '')
    // 如果结果为空，使用原始标签名的哈希
    || `tag-${Math.abs(hashCode(tagName))}`;
}

/**
 * 简单的字符串哈希函数
 * @param str 输入字符串
 * @returns 哈希值
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return hash;
}

/**
 * 从文章数据中处理标签
 * @param postsData 文章数据数组
 * @param config 标签配置
 * @returns 标签数据和映射表
 */
export function processTagsFromPosts(
  postsData: any[],
  config: Required<TagsConfig>
): { tagsData: TagData[]; tagsMap: Map<string, TagData> } {
  const tagsMap = new Map<string, TagData>();
  
  console.log(`[Tags Plugin] 开始处理 ${postsData.length} 篇文章的标签数据`);
  
  // 遍历所有文章，收集标签信息
  for (const post of postsData) {
    if (!post.tags || !Array.isArray(post.tags)) continue;
    
    for (let tagName of post.tags) {
      // 应用标签转换函数
      tagName = config.tagTransform(tagName.trim());
      
      // 跳过空标签和排除的标签
      if (!tagName || config.excludeTags.includes(tagName)) continue;
      
      const slug = generateTagSlug(tagName);
      const route = `/${config.routePrefix}/${slug}`;
      
      // 创建文章引用
      const postRef: PostReference = {
        title: post.title,
        route: post.route,
        createDate: post.createDate,
        updateDate: post.updateDate,
        description: post.description,
        tags: post.tags,
      };
      
      // 更新或创建标签数据
      if (tagsMap.has(tagName)) {
        const existingTag = tagsMap.get(tagName)!;
        existingTag.count += 1;
        existingTag.posts.push(postRef);
      } else {
        tagsMap.set(tagName, {
          name: tagName,
          slug,
          count: 1,
          posts: [postRef],
          route,
        });
      }
    }
  }
  
  // 过滤少于最小文章数量的标签
  for (const [tagName, tagData] of tagsMap.entries()) {
    if (tagData.count < config.minPostCount) {
      tagsMap.delete(tagName);
    }
  }
  
  // 对每个标签的文章按日期排序
  for (const tag of tagsMap.values()) {
    tag.posts.sort((a, b) => 
      new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
    );
  }
  
  // 将 Map 转换为数组并排序
  const tagsData = Array.from(tagsMap.values()).sort((a, b) => {
    switch (config.tagCloud.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'zh-CN');
      case 'count':
        return b.count - a.count;
      case 'date':
        return new Date(b.posts[0]?.createDate || 0).getTime() - 
               new Date(a.posts[0]?.createDate || 0).getTime();
      default:
        return b.count - a.count;
    }
  });
  
  console.log(`[Tags Plugin] 处理完成，共 ${tagsData.length} 个有效标签`);
  
  return { tagsData, tagsMap };
}

/**
 * 计算标签云的视觉权重
 * @param tag 当前标签
 * @param allTags 所有标签
 * @returns 权重值 (0-1)
 */
export function calculateTagWeight(tag: TagData, allTags: TagData[]): number {
  if (allTags.length <= 1) return 1;
  
  const minCount = Math.min(...allTags.map(t => t.count));
  const maxCount = Math.max(...allTags.map(t => t.count));
  
  if (minCount === maxCount) return 1;
  
  return (tag.count - minCount) / (maxCount - minCount);
}

/**
 * 获取相关标签
 * @param currentTagName 当前标签名
 * @param allTags 所有标签数据
 * @param limit 返回数量限制
 * @returns 相关标签列表
 */
export function getRelatedTags(
  currentTagName: string, 
  allTags: TagData[], 
  limit: number = 5
): TagData[] {
  const currentTag = allTags.find(tag => tag.name === currentTagName);
  if (!currentTag) return [];
  
  // 获取当前标签的文章集合
  const currentTagPosts = new Set(currentTag.posts.map(p => p.route));
  
  return allTags
    .filter(tag => tag.name !== currentTagName)
    .map(tag => ({
      ...tag,
      relevance: tag.posts.filter(post => currentTagPosts.has(post.route)).length
    }))
    .filter((tag: any) => tag.relevance > 0)
    .sort((a: any, b: any) => b.relevance - a.relevance)
    .slice(0, limit)
    .map(({ relevance, ...tag }: any) => tag); // 移除 relevance 属性
}

/**
 * 计算标签统计数据
 * @param tagsData 标签数据
 * @param postsData 文章数据
 * @returns 统计信息
 */
export function calculateTagStats(
  tagsData: TagData[], 
  postsData: any[]
): TagStats {
  if (tagsData.length === 0) {
    return {
      totalTags: 0,
      hottest: {} as TagData,
      newest: {} as TagData,
      averageTagsPerPost: 0,
      averagePostsPerTag: 0,
    };
  }
  
  // 找出最热门的标签（文章数量最多）
  const hottest = tagsData.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );
  
  // 找出最新的标签（最近有文章使用）
  const newest = tagsData.reduce((prev, current) => {
    const prevLatest = new Date(prev.posts[0]?.createDate || 0);
    const currentLatest = new Date(current.posts[0]?.createDate || 0);
    return prevLatest > currentLatest ? prev : current;
  });
  
  // 计算平均值
  const totalTagInstances = postsData.reduce((sum, post) => 
    sum + (post.tags?.length || 0), 0
  );
  const totalPostInstances = tagsData.reduce((sum, tag) => sum + tag.count, 0);
  
  return {
    totalTags: tagsData.length,
    hottest,
    newest,
    averageTagsPerPost: postsData.length > 0 ? totalTagInstances / postsData.length : 0,
    averagePostsPerTag: tagsData.length > 0 ? totalPostInstances / tagsData.length : 0,
  };
}

/**
 * 对标签进行分页
 * @param posts 文章列表
 * @param page 页码（从1开始）
 * @param perPage 每页数量
 * @returns 分页结果
 */
export function paginatePosts(
  posts: PostReference[], 
  page: number, 
  perPage: number
): { posts: PostReference[]; totalPages: number } {
  const totalPages = Math.ceil(posts.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages,
  };
}
