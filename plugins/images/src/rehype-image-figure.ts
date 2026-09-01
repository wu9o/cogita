interface HastTextNode {
  type: 'text';
  value: string;
}

interface HastElementNode {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}

interface HastParentNode {
  type: 'root';
  children: HastNode[];
}

type HastNode = HastElementNode | HastTextNode | HastParentNode;

function isElementNode(node: HastNode): node is HastElementNode {
  return (
    node.type === 'element' && typeof node.tagName === 'string' && Array.isArray(node.children)
  );
}

function hasChildren(node: HastNode): node is HastParentNode {
  return 'children' in node && Array.isArray(node.children);
}

function getImageTitle(node: HastElementNode): string | undefined {
  const title = node.properties?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : undefined;
}

function getClassNames(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.split(/\s+/).filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function convertImageParagraph(node: HastElementNode): boolean {
  if (node.tagName !== 'p' || node.children.length !== 1) {
    return false;
  }

  const image = node.children[0];
  if (!isElementNode(image) || image.tagName !== 'img') {
    return false;
  }

  const title = getImageTitle(image);
  if (!title) {
    return false;
  }

  const imageProperties = { ...image.properties };
  imageProperties.title = undefined;
  image.properties = imageProperties;

  const classNames = [
    ...new Set([...getClassNames(node.properties?.className), 'cogita-image-figure']),
  ];
  node.tagName = 'figure';
  node.properties = { ...node.properties, className: classNames };
  node.children = [
    image,
    {
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: title }],
    },
  ];
  return true;
}

function transformTree(node: HastNode): void {
  if (!hasChildren(node)) {
    return;
  }

  for (const child of node.children) {
    if (isElementNode(child) && convertImageParagraph(child)) {
      continue;
    }
    transformTree(child);
  }
}

/** 将独立 Markdown 图片的 title 转换为统一的 figure 说明文字。 */
export function rehypeImageFigure() {
  return (tree: unknown): void => {
    if (typeof tree === 'object' && tree !== null && 'children' in tree) {
      transformTree(tree as HastNode);
    }
  };
}
