import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pluginI18n } from '../dist/index.js';
import { resolveI18nConfig, resolveMessage } from '../dist/index.js';

describe('国际化插件', () => {
  it('未配置时应优雅跳过', () => {
    assert.equal(pluginI18n({ root: process.cwd(), cwd: process.cwd() }), null);
    assert.equal(
      pluginI18n({ root: process.cwd(), cwd: process.cwd(), i18n: { enabled: false } }),
      null
    );
  });

  it('应默认使用英文并支持区域语言回退', () => {
    const config = resolveI18nConfig({
      messages: {
        en: { greeting: 'Hello {{name}}' },
        'zh-CN': { greeting: '你好，{{name}}' },
      },
    });

    assert.equal(config.locale, 'en-US');
    assert.equal(config.fallbackLocale, 'en-US');
    assert.equal(
      resolveMessage(config.messages, 'en-US', 'en-US', 'greeting', '', { name: 'Cogita' }),
      'Hello Cogita'
    );
    assert.equal(
      resolveMessage(config.messages, 'fr-FR', 'zh-CN', 'greeting', '', { name: 'Cogita' }),
      '你好，Cogita'
    );
  });

  it('应生成稳定的虚拟文案模块并暴露能力契约', () => {
    const plugin = pluginI18n({
      root: '/tmp/cogita-i18n',
      cwd: '/tmp/cogita-i18n',
      site: { lang: 'en-US' },
      i18n: { messages: { 'en-US': { 'home.title': 'Welcome' } } },
    });

    assert.deepEqual(plugin?.cogita?.providesCapabilities, ['ui.i18n']);
    const source = plugin?.addRuntimeModules?.()['virtual-cogita-i18n-text'];
    assert.match(source, /export const i18nConfig/);
    assert.match(source, /home\.title/);
    assert.match(source, /export const supportedLocales/);
    assert.match(source, /export function getLocale/);
    assert.match(source, /export function setLocale/);
    assert.match(source, /export function t/);
  });

  it('应为缺少翻译的内容生成默认语言回退路由', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-i18n-'));
    const contentDir = path.join(root, 'content');
    await mkdir(contentDir, { recursive: true });
    await writeFile(path.join(contentDir, 'index.md'), '# Home\n', 'utf8');

    const plugin = pluginI18n({
      root,
      cwd: root,
      contentDir: 'content',
      locales: [
        { lang: 'en-US', label: 'English' },
        { lang: 'zh-CN', label: '中文' },
      ],
      site: { lang: 'en-US' },
      i18n: {
        contentFallback: true,
        messages: { 'en-US': { 'i18n.switcher.label': 'Language' } },
      },
    });

    const pages = await plugin?.addPages?.({}, true);
    assert.deepEqual(pages, [
      { routePath: '/zh-CN/', filepath: path.join(contentDir, 'index.md') },
    ]);
  });
});
