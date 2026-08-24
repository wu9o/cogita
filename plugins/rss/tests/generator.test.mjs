import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RSSGenerator } from '../dist/index.js';

const post = {
  title: '测试文章',
  description: '文章摘要',
  filePath: '/tmp/test.md',
  route: '/posts/test',
  url: '/posts/test',
  createDate: '2026-08-24',
  updateDate: '2026-08-24',
  content: '正文包含 ]]> 标记',
};

describe('RSSGenerator 正文输出', () => {
  it('开启 includeContent 时应输出 RSS、Atom 和 JSON Feed 正文', () => {
    const generator = new RSSGenerator(
      {
        title: '测试站点',
        description: '测试描述',
        link: 'https://example.com',
        formats: ['rss', 'atom', 'json'],
        includeContent: true,
      },
      'https://example.com'
    );

    const rss = generator.generateRSS([post]);
    assert.match(rss, /<content:encoded><!\[CDATA\[正文包含/);
    assert.ok(rss.includes('正文包含 ]]]]><![CDATA[> 标记'));
    assert.match(
      generator.generateAtom([post]),
      /<content type="text\/markdown"><!\[CDATA\[正文包含/
    );

    const feed = JSON.parse(generator.generateJSON([post]));
    assert.equal(feed.items[0].content_text, post.content);
    assert.equal(feed.items[0].content_html, undefined);
  });

  it('未开启 includeContent 时只输出摘要', () => {
    const generator = new RSSGenerator(
      {
        title: '测试站点',
        description: '测试描述',
        link: 'https://example.com',
      },
      'https://example.com'
    );

    assert.doesNotMatch(generator.generateRSS([post]), /content:encoded/);
    const feed = JSON.parse(generator.generateJSON([post]));
    assert.equal(feed.items[0].content_html, post.description);
    assert.equal(feed.items[0].content_text, undefined);
  });
});
