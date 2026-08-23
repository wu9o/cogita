// 虚拟模块类型声明

declare module 'virtual-posts-data' {
  interface Post {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    tags?: string[];
    categories?: string[];
    image?: string;
    imageAlt?: string;
    imageCaption?: string;
    imageWidth?: number;
    imageHeight?: number;
    url: string;
    filePath: string;
  }

  export const allPosts: Post[];
}

declare module 'virtual-images-data' {
  interface ImageData {
    src: string;
    width?: number;
    height?: number;
    alt?: string;
    caption?: string;
  }

  export const postCovers: Record<string, ImageData>;
}

declare module 'virtual-reading-progress-data' {
  interface ReadingProgressConfig {
    enabled: boolean;
    showBar: boolean;
    showReadingTime: boolean;
  }

  interface ReadingStats {
    readingTimeMinutes: number;
  }

  export const readingProgressConfig: ReadingProgressConfig;
  export function getReadingStats(route: string): ReadingStats | undefined;
}

declare module 'virtual-code-copy-data' {
  interface CodeCopyConfig {
    enabled: boolean;
    selector: string;
    buttonLabel: string;
    languageLabel: string;
    copiedLabel: string;
    errorLabel: string;
    resetDelay: number;
  }

  export const codeCopyConfig: CodeCopyConfig;
}

declare module 'virtual-comments-data' {
  interface CommentsConfig {
    enabled: boolean;
    provider: 'giscus' | 'utterances';
    title: string;
    giscus: Record<string, string | boolean>;
    utterances: Record<string, string>;
    postRoutes: string[];
  }

  export const commentsConfig: CommentsConfig;
}

declare module 'virtual-tags-data' {
  interface TagData {
    name: string;
    slug: string;
    count: number;
    posts: Array<{
      title: string;
      route: string;
      createDate: string;
      updateDate: string;
      description?: string;
      tags?: string[];
    }>;
    route: string;
  }

  export const allTags: TagData[];
  export const tagsConfig: { routePrefix: string };
  export function getRelatedTags(name: string, limit?: number): TagData[];
}

declare module 'virtual-collections-data' {
  interface CollectionPost {
    title: string;
    route: string;
    createDate: string;
    updateDate: string;
    description?: string;
    collectionTitle?: string;
  }

  interface CollectionData {
    slug: string;
    title: string;
    description?: string;
    posts: CollectionPost[];
    count: number;
    route: string;
    createdDate?: string;
    updatedDate?: string;
  }

  export const allCollections: CollectionData[];
  export function getCollectionBySlug(slug: string): CollectionData | undefined;
  export function getCollectionByPostRoute(route: string): CollectionData | undefined;
}

declare module 'virtual-categories-data' {
  interface CategoryData {
    title: string;
    path: string;
    slug: string;
    depth: number;
    description?: string;
    posts: Array<{
      title: string;
      route: string;
      createDate: string;
      updateDate: string;
      description?: string;
      tags?: string[];
    }>;
    count: number;
    children: string[];
    route: string;
  }

  export const allCategories: CategoryData[];
  export const categoryMap: Record<string, CategoryData>;
  export const categoriesConfig: { routePrefix: string };
  export function getCategoryBySlug(slug: string): CategoryData | undefined;
  export function getCategoryBreadcrumbs(path: string): CategoryData[];
}

declare module 'virtual-blog-list-data' {
  interface BlogPost {
    title: string;
    description?: string;
    route: string;
    createDate: string;
    updateDate: string;
    tags?: string[];
    categories?: string[];
    url: string;
    filePath: string;
  }

  interface BlogPage {
    page: number;
    totalPages: number;
    posts: BlogPost[];
    previous?: string;
    next?: string;
  }

  interface ArchiveData {
    key: string;
    label: string;
    count: number;
    posts: BlogPost[];
    route: string;
  }

  export const allBlogListPages: BlogPage[];
  export const allArchives: ArchiveData[];
  export const blogListConfig: {
    routePrefix: string;
    archivePrefix: string;
  };
  export function getArchive(key: string): ArchiveData | undefined;
}

declare module 'virtual-search-data' {
  interface SearchDocument {
    title: string;
    route: string;
    description?: string;
    excerpt?: string;
    content?: string;
    updateDate: string;
    tags?: string[];
    categories?: string[];
  }

  export const searchDocuments: SearchDocument[];
  export const searchConfig: {
    minQueryLength: number;
    maxResults: number;
  };
}
