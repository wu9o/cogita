export interface Post {
  title: string;
  description?: string;
  filePath: string;
  route: string;
  createDate: string;
  updateDate: string;
  categories?: string[];
  tags?: string[];
  url: string;
}
