import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  cleanMarkdownContent,
  createSearchIndexHash,
  extractSearchDocuments,
  resolveSearchConfig,
} from '../dist/utils.js';

describe('搜索索引工具函数', () => {
  it('应规范化搜索配置并保留默认字段', () => {
    const config = resolveSearchConfig({ routePrefix: '/search/', maxResults: 0 });

    assert.equal(config.routePrefix, 'search');
    assert.equal(config.maxResults, 1);
    assert.equal(config.fields.title, true);
    assert.equal(config.fields.content, false);
  });

  it('开启正文索引时应默认启用 content 字段，并允许显式关闭', () => {
    assert.equal(resolveSearchConfig({ includeContent: true }).fields.content, true);
    assert.equal(
      resolveSearchConfig({ includeContent: true, fields: { content: false } }).fields.content,
      false
    );
  });

  it('搜索分析默认关闭，并支持显式配置事件字段', () => {
    const defaults = resolveSearchConfig();
    assert.equal(defaults.analytics.enabled, false);
    assert.equal(defaults.analytics.eventName, 'cogita:search');
    assert.equal(defaults.analytics.includeQuery, false);
    assert.equal(defaults.analytics.includeFilters, false);

    const configured = resolveSearchConfig({
      analytics: {
        enabled: true,
        eventName: 'site_search',
        includeQuery: true,
        includeFilters: true,
      },
    });
    assert.deepEqual(configured.analytics, {
      enabled: true,
      eventName: 'site_search',
      includeQuery: true,
      includeFilters: true,
    });
  });

  it('应移除 frontmatter、代码块和 Markdown 标记', () => {
    const content = cleanMarkdownContent(
      '---\ntitle: 测试\n---\n# 标题\n\n正文 [链接](https://example.com)。\n\n```ts\nconst hidden = true;\n```',
      500
    );

    assert.equal(content, '标题 正文 链接。');
  });

  it('应限制正文索引长度', () => {
    assert.equal(cleanMarkdownContent('一二三四五', 3), '一二三');
    assert.equal(cleanMarkdownContent('一二三四五', 0), '');
  });

  it('同一索引数据应生成稳定 hash', () => {
    const documents = [{ id: '/posts/demo', title: 'Demo' }];
    assert.equal(createSearchIndexHash(documents), createSearchIndexHash(documents));
    assert.notEqual(
      createSearchIndexHash(documents),
      createSearchIndexHash([{ ...documents[0], title: 'Changed' }])
    );
  });

  it('有共享内容索引时应直接使用索引元数据', async () => {
    const documents = await extractSearchDocuments(
      'missing-posts',
      process.cwd(),
      'posts',
      ['md'],
      resolveSearchConfig(),
      {
        getPosts: async () => [
          {
            title: '索引文章',
            description: '来自索引',
            filePath: '/missing-posts/index.md',
            route: '/posts/indexed',
            createDate: '2026-08-24',
            updateDate: '2026-08-24',
            url: '/posts/indexed',
          },
        ],
      }
    );

    assert.deepEqual(
      documents.map((document) => document.route),
      ['/posts/indexed']
    );
    assert.equal(documents[0].description, '来自索引');
  });

  it('存在统一内容索引时应同时生成文章和文档搜索条目', async () => {
    const documents = await extractSearchDocuments(
      'missing-posts',
      process.cwd(),
      'posts',
      ['md'],
      resolveSearchConfig(),
      {
        getPosts: async () => [],
        getEntries: async () => [
          {
            kind: 'post',
            title: '文章条目',
            filePath: '/missing-posts/article.md',
            route: '/posts/article',
            createDate: '2026-08-24',
            updateDate: '2026-08-24',
            url: '/posts/article',
          },
          {
            kind: 'document',
            title: '文档条目',
            filePath: '/missing-content/guide.md',
            route: '/guide',
            updateDate: '2026-08-25',
            url: '/guide',
          },
        ],
      }
    );

    assert.deepEqual(
      documents.map((document) => [document.kind, document.route]),
      [
        ['document', '/guide'],
        ['post', '/posts/article'],
      ]
    );
    assert.equal(documents[0].createDate, '2026-08-25');
  });

  it('全文搜索应通过统一内容索引读取外部来源正文', async () => {
    const documents = await extractSearchDocuments(
      'missing-posts',
      process.cwd(),
      'posts',
      ['md'],
      resolveSearchConfig({ includeContent: true }),
      {
        getPosts: async () => [],
        getEntries: async () => [
          {
            kind: 'document',
            sourceId: 'json-export',
            title: '外部笔记',
            filePath: 'source://json-export/external-note',
            route: '/notes/external-note',
            updateDate: '2026-08-25',
            url: '/notes/external-note',
          },
        ],
        getPostContent: async (filePath) => {
          assert.equal(filePath, 'source://json-export/external-note');
          return '# 外部笔记\n\n这段正文来自内容源。';
        },
      }
    );

    assert.equal(documents[0].content, '外部笔记 这段正文来自内容源。');
  });
});
