import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { getCogitaDiagnostic } from '@cogita/shared';
import {
  isCogitaThemeConfig,
  loadCogitaConfig,
  prepareContentDirectory,
} from '../dist/es/index.js';

describe('配置错误诊断', () => {
  it('Core 与 CLI 应共享最小主题契约判断', () => {
    assert.equal(
      isCogitaThemeConfig({ name: '@cogita/theme-test', pageLayouts: { home: './Home.js' } }),
      true
    );
    assert.equal(
      isCogitaThemeConfig({ name: '@cogita/theme-test', pageLayouts: { tag: './Tag.js' } }),
      false
    );
    assert.equal(isCogitaThemeConfig({ pageLayouts: { home: './Home.js' } }), false);
  });

  it('首次构建相关命令应识别缺少配置文件', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cogita-config-missing-'));

    await assert.rejects(loadCogitaConfig(root, { required: true }), (error) => {
      const diagnostic = getCogitaDiagnostic(error);
      assert.equal(diagnostic?.code, 'COGITA_CONFIG_NOT_FOUND');
      assert.match(diagnostic?.hint || '', /@cogita\/cli create/);
      return true;
    });
  });

  it('配置文件语法错误应保留错误码和可执行提示', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cogita-config-invalid-'));
    fs.writeFileSync(path.join(root, 'cogita.config.ts'), 'export default { theme: ; }\n');

    await assert.rejects(loadCogitaConfig(root, { required: true }), (error) => {
      const diagnostic = getCogitaDiagnostic(error);
      assert.equal(diagnostic?.code, 'COGITA_CONFIG_LOAD_FAILED');
      assert.equal(error.cause instanceof Error, true);
      assert.match(diagnostic?.hint || '', /cogita\.config\.ts/);
      return true;
    });
  });

  it('内容目录错误应提供配置字段和修复提示', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cogita-content-dir-'));

    await assert.rejects(
      prepareContentDirectory(root, path.join(root, '.cogita_content'), 'content'),
      (error) => {
        const diagnostic = getCogitaDiagnostic(error);
        assert.equal(diagnostic?.code, 'COGITA_CONTENT_DIR_NOT_FOUND');
        assert.deepEqual(diagnostic?.details, {
          contentDir: 'content',
          sourceDirectory: path.join(root, 'content'),
        });
        assert.match(diagnostic?.hint || '', /创建该目录/);
        return true;
      }
    );
  });
});
