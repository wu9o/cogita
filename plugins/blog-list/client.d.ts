declare module 'virtual-blog-list-data' {
  export const cogitaVirtualModuleVersion: 1;
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
    filter?: BlogListFilter;
  }

  interface BlogListFilter {
    key: string;
    kind: 'tag' | 'category';
    value: string;
    label: string;
    slug: string;
    count: number;
    route: string;
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
  export const allBlogListFilters: BlogListFilter[];
  export const allArchives: BlogArchive[];
  export function getBlogListPage(page: number, filterKey?: string): BlogListPage | undefined;
  export function getBlogListFilter(key: string): BlogListFilter | undefined;
  export function getArchive(key: string): BlogArchive | undefined;
}
