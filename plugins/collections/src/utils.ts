import { getFrontmatterFromFile } from '@cogita/plugin-posts-frontmatter';
import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { glob } from 'glob';
import type {
  CollectionData,
  CollectionMetadata,
  CollectionPost,
  CollectionStats,
  CollectionsConfig,
} from './types';

/**
 * 从文章中提取合集信息（复用 posts-frontmatter 的扫描逻辑）
 * @param postsDir 文章目录
 * @param cwd 当前工作目录
 * @param routePrefix 路由前缀
 * @returns 文章数据数组
 */
export async function extractCollectionsFromPosts(
  postsDir: string,
  cwd: string,
  routePrefix = 'posts'
): Promise<PostFrontmatter[]> {
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
        console.warn(`[Collections Plugin] 跳过文件 ${filePath}:`, error);
        return null;
      }
    })
    .filter((f): f is PostFrontmatter => f !== null);
}

/**
 * 从文章数据中处理合集
 * @param postsData 文章数据数组
 * @param config 合集配置
 * @returns 合集数据数组和映射表
 */
export function processCollectionsFromPosts(
  postsData: PostFrontmatter[],
  config: Required<CollectionsConfig>
): { collectionsData: CollectionData[]; collectionsMap: Map<string, CollectionData> } {
  const collectionsMap = new Map<string, CollectionData>();

  console.log(`[Collections Plugin] 开始处理 ${postsData.length} 篇文章的合集数据`);

  // 遍历所有文章，按 collection 字段分组
  for (const post of postsData) {
    if (!post.collection) continue;

    const slug = post.collection;

    // 跳过排除的合集
    if (config.excludeCollections.includes(slug)) continue;

    const route = `/${config.routePrefix}/${slug}`;

    // 创建合集内的文章引用
    const collectionPost: CollectionPost = {
      title: post.title,
      route: post.route,
      createDate: post.createDate,
      updateDate: post.updateDate,
      description: post.description,
      order: post.order ?? 0,
      collectionTitle: post.collectionTitle,
    };

    // 更新或创建合集
    const existing = collectionsMap.get(slug);
    if (existing) {
      existing.posts.push(collectionPost);
    } else {
      // 从配置元数据获取标题/描述/封面
      const meta: CollectionMetadata | undefined = config.metadata?.[slug];
      collectionsMap.set(slug, {
        slug,
        title: meta?.title || slug,
        description: meta?.description,
        cover: meta?.cover,
        posts: [collectionPost],
        count: 0,
        route,
      });
    }
  }

  // 过滤少于最小文章数量的合集
  for (const [slug, collection] of collectionsMap.entries()) {
    if (collection.posts.length < config.minPostCount) {
      collectionsMap.delete(slug);
    }
  }

  // 对每个合集的文章排序：有 order 的按 order 升序，无 order 的按日期升序排在末尾
  for (const collection of collectionsMap.values()) {
    collection.posts.sort((a, b) => {
      // 两个都有 order → 按 order
      if (a.order > 0 && b.order > 0) return a.order - b.order;
      // 一个有 order 一个没有 → 有 order 的在前
      if (a.order > 0) return -1;
      if (b.order > 0) return 1;
      // 都没有 → 按日期升序
      return new Date(a.createDate).getTime() - new Date(b.createDate).getTime();
    });

    // 重新编号 order（从 1 开始）
    collection.posts.forEach((post, index) => {
      post.order = index + 1;
    });

    // 更新 count 和日期范围
    collection.count = collection.posts.length;
    collection.createdDate = collection.posts[0]?.createDate;
    collection.updatedDate = collection.posts[collection.posts.length - 1]?.createDate;
  }

  // 转换为数组，按文章数量降序排列
  const collectionsData = Array.from(collectionsMap.values()).sort((a, b) => b.count - a.count);

  console.log(`[Collections Plugin] 处理完成，共 ${collectionsData.length} 个合集`);

  return { collectionsData, collectionsMap };
}

/**
 * 计算合集统计数据
 * @param collectionsData 合集数据
 * @returns 统计信息
 */
export function calculateCollectionStats(collectionsData: CollectionData[]): CollectionStats {
  if (collectionsData.length === 0) {
    return {
      totalCollections: 0,
      largest: {} as CollectionData,
      newest: {} as CollectionData,
      averagePostsPerCollection: 0,
    };
  }

  // 文章最多的合集
  const largest = collectionsData.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  );

  // 最新更新的合集
  const newest = collectionsData.reduce((prev, current) => {
    const prevDate = new Date(prev.updatedDate || 0);
    const currentDate = new Date(current.updatedDate || 0);
    return currentDate > prevDate ? current : prev;
  });

  const totalPosts = collectionsData.reduce((sum, c) => sum + c.count, 0);

  return {
    totalCollections: collectionsData.length,
    largest,
    newest,
    averagePostsPerCollection: totalPosts / collectionsData.length,
  };
}
