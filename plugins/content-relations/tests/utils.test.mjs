import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractMarkdownLinks } from '../dist/index.js';

describe('内容关系 Markdown 链接提取', () => {
  it('应提取站内文本链接并忽略外部链接、锚点和图片', () => {
    const links = extractMarkdownLinks(`
[文章 A](./a.md)
![图片](/images/example.png)
[外部](https://example.com)
[锚点](#section)
`);

    assert.deepEqual(links, [{ label: '文章 A', href: './a.md' }]);
  });

  it('不应把 fenced code 中的示例链接当作关系', () => {
    const links = extractMarkdownLinks(`
\`\`\`md
[代码示例](./example.md)
\`\`\`
[真实链接](./real.md)
`);

    assert.deepEqual(links, [{ label: '真实链接', href: './real.md' }]);
  });
});
