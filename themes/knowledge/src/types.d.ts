declare module 'virtual-search-data' {
  export const cogitaVirtualModuleVersion: 1;
  export const searchConfig: {
    enabled: boolean;
    routePrefix: string;
    minQueryLength: number;
    maxResults: number;
  };
  export const searchDocuments: Array<{
    id: string;
    kind?: 'post' | 'document';
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
  }>;
}

declare module 'virtual-tags-data' {
  export const allTags: Array<{
    name: string;
    slug: string;
    count: number;
    route: string;
    posts: Array<{
      title: string;
      route: string;
      createDate: string;
      updateDate: string;
      description?: string;
      tags?: string[];
    }>;
  }>;
  export const tagsConfig: { routePrefix: string };
  export function getRelatedTags(
    name: string,
    limit?: number
  ): Array<{
    name: string;
    slug: string;
    count: number;
    route: string;
  }>;
}

declare module 'virtual-content-relations-data' {
  export const contentRelations: Array<{
    route: string;
    outbound: Array<ContentRelationLink>;
    inbound: Array<ContentRelationLink>;
  }>;
  export function getContentRelations(route: string): {
    route: string;
    outbound: Array<ContentRelationLink>;
    inbound: Array<ContentRelationLink>;
  };
  export function getBacklinks(route: string): Array<ContentRelationLink>;
  export function getOutgoingLinks(route: string): Array<ContentRelationLink>;

  interface ContentRelationLink {
    kind: 'post' | 'document';
    title: string;
    route: string;
    url: string;
    description?: string;
    tags?: string[];
    label?: string;
    href: string;
  }
}
