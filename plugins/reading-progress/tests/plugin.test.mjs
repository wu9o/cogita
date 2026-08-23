import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pluginReadingProgress } from '../dist/plugin.js';

describe('阅读进度插件工厂', () => {
  it('关闭插件时仍应提供安全的空运行时模块', () => {
    const plugin = pluginReadingProgress({
      cwd: process.cwd(),
      readingProgress: { enabled: false },
    });

    assert.ok(plugin);
    assert.equal(plugin.name, '@cogita/plugin-reading-progress');

    const runtimeModules = plugin.addRuntimeModules();
    const runtimeModule = runtimeModules['virtual-reading-progress-data'];

    assert.match(runtimeModule, /enabled.*false/);
    assert.match(runtimeModule, /readingStatsByRoute/);
  });
});
