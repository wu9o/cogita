declare module 'virtual-search-data' {
  export const cogitaVirtualModuleVersion: 1;
  interface SearchDocument {
    id: string;
    title: string;
    route: string;
    url: string;
    description?: string;
    excerpt?: string;
    tags?: string[];
    categories?: string[];
    content?: string;
    createDate: string;
    updateDate: string;
    image?: string;
    imageAlt?: string;
  }

  interface SearchConfig {
    enabled: boolean;
    routePrefix: string;
    includeContent: boolean;
    maxContentLength: number;
    maxResults: number;
    minQueryLength: number;
    fields: {
      title: boolean;
      description: boolean;
      excerpt: boolean;
      tags: boolean;
      categories: boolean;
      content: boolean;
    };
    analytics: {
      enabled: boolean;
      eventName: string;
      includeQuery: boolean;
      includeFilters: boolean;
    };
  }

  export const searchConfig: SearchConfig;
  export const searchDocuments: SearchDocument[];
  export const searchIndexHash: string;
}
