export interface Post {
  title: string;
  description?: string;
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
