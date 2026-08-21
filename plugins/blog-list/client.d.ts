declare module 'virtual-blog-list-data' {
  interface BlogListPost {
    title: string;
    description?: string;
    excerpt?: string;
    author?: string;
    filePath: string;
    route: string;
    createDate: string;
    updateDate: string;
    categories?: string[];
    tags?: string[];
    image?: string;
    imageAlt?: string;
    imageCaption?: string;
    imageWidth?: number;
    imageHeight?: number;
    url: string;
  }

  interface BlogListPage {
    page: number;
    totalPages: number;
    posts: BlogListPost[];
    route: string;
    previous?: string;
    next?: string;
  }

  interface BlogArchive {
    key: string;
    label: string;
    count: number;
    posts: BlogListPost[];
    route: string;
  }

  interface BlogListConfig {
    enabled: boolean;
    routePrefix: string;
    pageSize: number;
    sortBy: 'createDate' | 'updateDate' | 'title';
    order: 'asc' | 'desc';
    generateArchives: boolean;
    archivePrefix: string;
    archiveGranularity: 'year' | 'month';
  }

  export const blogListConfig: BlogListConfig;
  export const allBlogListPages: BlogListPage[];
  export const allArchives: BlogArchive[];
  export function getBlogListPage(page: number): BlogListPage | undefined;
  export function getArchive(key: string): BlogArchive | undefined;
}
