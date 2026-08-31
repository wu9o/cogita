import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rehypeImageFigure } from '../dist/index.js';

function transform(tree) {
  rehypeImageFigure()(tree);
  return tree;
}

describe('正文图片说明文字', () => {
  it('应将独立图片 title 转换为 figure 和 figcaption', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { src: '/images/example.png', alt: '示例', title: '图片说明' },
              children: [],
            },
          ],
        },
      ],
    });

    const figure = tree.children[0];
    assert.equal(figure.tagName, 'figure');
    assert.deepEqual(figure.properties.className, ['cogita-image-figure']);
    assert.equal(figure.children[0].properties.title, undefined);
    assert.equal(figure.children[1].tagName, 'figcaption');
    assert.equal(figure.children[1].children[0].value, '图片说明');
  });

  it('没有 title 时应保留原始图片段落', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { src: '/images/example.png', alt: '示例' },
              children: [],
            },
          ],
        },
      ],
    });

    assert.equal(tree.children[0].tagName, 'p');
    assert.equal(tree.children[0].children[0].properties.title, undefined);
  });

  it('图片旁边有文本时不应误转换为 figure', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { src: '/images/example.png', alt: '示例', title: '图片说明' },
              children: [],
            },
            { type: 'text', value: '附加文字' },
          ],
        },
      ],
    });

    assert.equal(tree.children[0].tagName, 'p');
    assert.equal(tree.children[0].children[0].properties.title, '图片说明');
  });
});
