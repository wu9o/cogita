import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pluginComments } from '../dist/plugin.js';

describe('评论插件工厂', () => {
  it('关闭评论时仍应提供安全的空运行时模块', () => {
    const plugin = pluginComments({
      cwd: process.cwd(),
      comments: { enabled: false },
    });

    assert.ok(plugin);
    assert.equal(plugin.name, '@cogita/plugin-comments');

    const runtimeModules = plugin.addRuntimeModules();
    assert.match(runtimeModules['virtual-comments-data'], /enabled.*false/);
    assert.match(runtimeModules['virtual-comments-data'], /postRoutes/);
  });
});
