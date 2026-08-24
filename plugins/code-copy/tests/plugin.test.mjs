import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pluginCodeCopy, resolveCodeCopyConfig } from '../dist/plugin.js';

describe('代码复制插件', () => {
  it('应生成默认配置和运行时模块', () => {
    const plugin = pluginCodeCopy({
      cwd: process.cwd(),
      codeCopy: {},
    });

    assert.ok(plugin);
    assert.equal(plugin.name, '@cogita/plugin-code-copy');
    assert.match(plugin.addRuntimeModules()['virtual-code-copy-data'], /复制代码/);
  });

  it('关闭插件时应保留安全的运行时模块', () => {
    const plugin = pluginCodeCopy({
      cwd: process.cwd(),
      codeCopy: { enabled: false },
    });

    assert.ok(plugin);
    assert.match(plugin.addRuntimeModules()['virtual-code-copy-data'], /enabled.*false/);
  });

  it('应限制无效的状态恢复时间', () => {
    assert.equal(resolveCodeCopyConfig({ resetDelay: -10 }).resetDelay, 0);
    assert.equal(resolveCodeCopyConfig({ resetDelay: Number.NaN }).resetDelay, 2000);
  });

  it('应保留语言级复制提示模板', () => {
    assert.equal(
      resolveCodeCopyConfig({ languageLabel: '复制 {language}' }).languageLabel,
      '复制 {language}'
    );
  });

  it('应提供选中代码的默认提示', () => {
    assert.equal(resolveCodeCopyConfig({}).selectionLabel, '复制选中代码');
    assert.equal(
      resolveCodeCopyConfig({ selectionLabel: '复制选中部分' }).selectionLabel,
      '复制选中部分'
    );
  });
});
