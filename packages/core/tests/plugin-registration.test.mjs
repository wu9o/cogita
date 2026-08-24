import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRspressConfig } from '../dist/es/index.js';

describe('插件注册契约', () => {
  it('应按主题插件之后的顺序加载用户插件，并注入统一构建上下文', async () => {
    let receivedConfig;
    const userPlugin = (config) => {
      receivedConfig = config;
      return { name: 'test-user-plugin' };
    };

    const rspressConfig = await createRspressConfig(
      { plugins: [userPlugin] },
      '/tmp/cogita-plugin-registration-test'
    );
    const pluginNames = rspressConfig.plugins.map(({ name }) => name);

    assert.equal(pluginNames.at(0), 'cogita-content-index');
    assert.equal(pluginNames.at(-1), 'test-user-plugin');
    assert.equal(receivedConfig.buildContext.root, '/tmp/cogita-plugin-registration-test');
    assert.equal(receivedConfig.buildContext.strict, true);
    assert.equal(typeof receivedConfig.buildContext.logger.info, 'function');
  });

  it('严格模式下应拒绝重复注册的插件名称', async () => {
    const duplicatePlugin = () => ({ name: 'duplicate-test-plugin' });

    await assert.rejects(
      createRspressConfig(
        { plugins: [duplicatePlugin, duplicatePlugin] },
        '/tmp/cogita-plugin-registration-test'
      ),
      /重复注册/
    );
  });

  it('非严格模式下应保留首次注册的插件并记录警告', async () => {
    const warnings = [];
    const duplicatePlugin = () => ({ name: 'duplicate-test-plugin' });
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);

    let rspressConfig;
    try {
      rspressConfig = await createRspressConfig(
        { strict: false, plugins: [duplicatePlugin, duplicatePlugin] },
        '/tmp/cogita-plugin-registration-test'
      );
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(
      rspressConfig.plugins.filter(({ name }) => name === 'duplicate-test-plugin').length,
      1
    );
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /非严格模式下保留首次注册/);
  });
});
