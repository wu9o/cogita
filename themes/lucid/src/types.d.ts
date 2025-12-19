// 虚拟模块类型声明

declare module 'virtual-posts-data' {
  interface Post {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    tags?: string[];
    url: string;
    filePath: string;  // 添加缺失的字段
  }

  export const allPosts: Post[];
}

declare module 'virtual-tags-data' {
  interface TagData {
    name: string;
    slug: string;
    count: number;
    route: string;
    posts: any[];
  }
  
  interface TagsConfig {
    routePrefix: string;
    tagCloud: {
      minFontSize: number;
      maxFontSize: number;
      minOpacity: number;
      maxOpacity: number;
      sortBy: 'name' | 'count' | 'date';
      limit: number;
    };
    postsPerPage: number;
  }

  export const allTags: TagData[];
  export const tagMap: Record<string, TagData>;
  export const tagsConfig: TagsConfig;
  export const tagStats: any;
  
  export function getTagBySlug(slug: string): TagData | undefined;
  export function getPostsByTag(tagName: string): any[];
  export function getRelatedTags(currentTag: string, limit?: number): TagData[];
  export function calculateTagWeight(tag: TagData, allTags?: TagData[]): number;
  export function getTagPagination(tagName: string, page?: number, perPage?: number): any;
}
