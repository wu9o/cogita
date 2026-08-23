import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveCommentsConfig, validateCommentsConfig } from '../dist/utils.js';

describe('评论插件工具函数', () => {
  it('默认应关闭评论并保留安全的提供商配置', () => {
    const config = resolveCommentsConfig();

    assert.equal(config.enabled, false);
    assert.equal(config.provider, 'giscus');
    assert.deepEqual(config.postRoutes, []);
    assert.equal(validateCommentsConfig(config), null);
  });

  it('应校验 Giscus 的仓库和分类配置', () => {
    const config = resolveCommentsConfig({ enabled: true, provider: 'giscus' }, ['/posts/a']);

    assert.equal(
      validateCommentsConfig(config),
      'Giscus 缺少必填配置：comments.giscus.repo、comments.giscus.repoId、comments.giscus.category、comments.giscus.categoryId'
    );
  });

  it('应允许完整的 Utterances 配置', () => {
    const config = resolveCommentsConfig({
      enabled: true,
      provider: 'utterances',
      utterances: { repo: 'wu9o/cogita', issueTerm: 'pathname' },
    });

    assert.equal(validateCommentsConfig(config), null);
    assert.deepEqual(config.postRoutes, []);
  });
});
