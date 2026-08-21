// 虚拟模块类型声明

declare module 'virtual-posts-data' {
  interface Post {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    tags?: string[];
    image?: string;
    imageAlt?: string;
    imageCaption?: string;
    imageWidth?: number;
    imageHeight?: number;
    url: string;
    filePath: string; // 添加缺失的字段
  }

  export const allPosts: Post[];
}

declare module 'virtual-images-data' {
  interface ImageData {
    src: string;
    relativePath?: string;
    name?: string;
    extension?: string;
    width?: number;
    height?: number;
    alt?: string;
    caption?: string;
    source: 'public' | 'external';
    postRoute?: string;
  }

  interface ImageUsage {
    src: string;
    count: number;
    postRoutes: string[];
  }

  export const allImages: ImageData[];
  export const postCovers: Record<string, ImageData>;
  export const imageUsage: Record<string, ImageUsage>;
  export function getImageBySrc(src: string): ImageData | undefined;
  export function getPostCover(route: string): ImageData | undefined;
  export function getUnusedImages(): ImageData[];
}

declare module 'virtual-tags-data' {
  interface PostReference {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    tags?: string[];
  }

  interface TagData {
    name: string;
    slug: string;
    count: number;
    posts: PostReference[];
    route: string;
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
  }

  interface TagStats {
    totalTags: number;
    hottest: TagData;
    newest: TagData;
    averageTagsPerPost: number;
    averagePostsPerTag: number;
  }

  export const allTags: TagData[];
  export const tagMap: Record<string, TagData>;
  export const tagsConfig: TagsConfig;
  export const tagStats: TagStats;

  export function getTagBySlug(slug: string): TagData | undefined;
  export function getPostsByTag(tagName: string): PostReference[];
  export function getRelatedTags(currentTag: string, limit?: number): TagData[];
}

declare module 'virtual-collections-data' {
  interface CollectionPost {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    order: number;
    collectionTitle?: string;
  }

  interface CollectionData {
    slug: string;
    title: string;
    description?: string;
    cover?: string;
    posts: CollectionPost[];
    count: number;
    route: string;
    createdDate?: string;
    updatedDate?: string;
  }

  interface CollectionsConfig {
    enabled: boolean;
    routePrefix: string;
    metadata: Record<string, { title?: string; description?: string; cover?: string }>;
    excludeCollections: string[];
    minPostCount: number;
  }

  interface CollectionStats {
    totalCollections: number;
    largest: CollectionData;
    newest: CollectionData;
    averagePostsPerCollection: number;
  }

  export const allCollections: CollectionData[];
  export const collectionMap: Record<string, CollectionData>;
  export const collectionsConfig: CollectionsConfig;
  export const collectionStats: CollectionStats;

  export function getCollectionBySlug(slug: string): CollectionData | undefined;
  export function getPostsByCollection(slug: string): CollectionPost[];
  export function getCollectionByPostRoute(route: string): CollectionData | undefined;
}
