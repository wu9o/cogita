declare module 'virtual-images-data' {
  export const cogitaVirtualModuleVersion: 1;
  export interface ImageData {
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

  export interface ImageUsage {
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
