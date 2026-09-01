declare module 'virtual-content-relations-data' {
  export const cogitaVirtualModuleVersion: 1;
  import type { ContentRelationEntry, ContentRelationLink } from '@cogita/plugin-content-relations';

  export const contentRelations: ContentRelationEntry[];
  export const relationMap: Record<string, ContentRelationEntry>;
  export function getContentRelations(route: string): ContentRelationEntry;
  export function getBacklinks(route: string): ContentRelationLink[];
  export function getOutgoingLinks(route: string): ContentRelationLink[];
  export function getRelatedContent(route: string, limit?: number): ContentRelationLink[];
}
