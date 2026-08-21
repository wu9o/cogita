import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cleanMarkdownContent, createSearchIndexHash, resolveSearchConfig } from '../dist/utils.js';

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
});
