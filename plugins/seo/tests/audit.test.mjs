import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSEOAuditReport } from '../dist/audit.js';

test('SEO 审核报告应遵循统一质量报告 schema', () => {
  const report = createSEOAuditReport([
    {
      route: '/',
      meta: {
        title: '首页',
        description:
          '这是一段超过默认长度限制的页面描述，用于验证统一报告中的页面数量、报告类型、计数和诊断字段能够被稳定消费。',
        canonical: 'https://example.com/',
        type: 'WebSite',
        robots: 'index, follow',
        twitterCard: 'summary',
      },
    },
  ]);

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.reportType, 'seo-audit');
  assert.equal(report.itemCount, 1);
  assert.equal(report.pageCount, 1);
  assert.deepEqual(report.issues, []);
});

test('SEO 审核报告的问题字段应能被统一门禁消费', () => {
  const report = createSEOAuditReport([
    {
      route: '/posts/test',
      meta: {
        title: '文章',
        description: '',
        type: 'Article',
        robots: 'index, follow',
        twitterCard: 'summary',
      },
    },
  ]);

  assert.equal(report.errors, 2);
  assert.equal(report.issues[0].severity, 'error');
  assert.equal(report.issues[0].route, '/posts/test');
  assert.equal(typeof report.issues[0].message, 'string');
});
