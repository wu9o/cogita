/** 运行时可安全暴露的内容关系节点。 */
export interface ContentRelationNode {
  title: string;
  route: string;
  url: string;
  description?: string;
  tags?: string[];
}

/** 一条指向其他内容节点的关系边。 */
export interface ContentRelationLink extends ContentRelationNode {
  /** Markdown 链接中的可见文本。 */
  label?: string;
  /** 原始 Markdown 链接目标，便于主题保留锚点和查询参数。 */
  href: string;
}

/** 单篇内容的出链和反向链接集合。 */
export interface ContentRelationEntry {
  route: string;
  outbound: ContentRelationLink[];
  inbound: ContentRelationLink[];
}
