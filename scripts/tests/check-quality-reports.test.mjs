import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scriptPath = path.join(repositoryRoot, 'scripts/check-quality-reports.mjs');

function runGate(root, args, env = {}) {
  return spawnSync(process.execPath, [scriptPath, '--root', root, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_ACTIONS: 'false', ...env },
  });
}

function createReport(overrides = {}) {
  return {
    schemaVersion: 1,
    reportType: 'content-check',
    generatedAt: '2026-08-26T00:00:00.000Z',
    itemCount: 1,
    postCount: 1,
    errors: 0,
    warnings: 0,
    issues: [],
    ...overrides,
  };
}

test('质量门禁应兼容统一报告并按错误阈值失败', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-quality-gate-'));
  try {
    await writeFile(
      path.join(root, 'content-report.json'),
      JSON.stringify(
        createReport({
          errors: 1,
          issues: [
            {
              severity: 'error',
              code: 'missing-title',
              route: '/posts/test',
              filePath: path.join(root, 'posts/test.md'),
              message: '缺少标题',
            },
          ],
        })
      )
    );

    const result = runGate(root, ['--report', 'content-report.json', '--no-annotations']);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /COGITA|Quality Gate|missing-title/);
    assert.match(`${result.stdout}${result.stderr}`, /超出配置/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('质量门禁应支持警告阈值和 GitHub annotation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-quality-gate-'));
  try {
    await writeFile(
      path.join(root, 'seo-report.json'),
      JSON.stringify(
        createReport({
          reportType: 'seo-audit',
          pageCount: 1,
          warnings: 1,
          issues: [
            {
              severity: 'warning',
              code: 'short-description',
              route: '/',
              message: 'description 过短',
            },
          ],
        })
      )
    );

    const result = runGate(
      root,
      ['--report', 'seo-report.json', '--max-warnings', '1', '--annotations', 'always'],
      { GITHUB_WORKSPACE: root }
    );
    assert.equal(result.status, 0);
    assert.match(result.stdout, /::warning /);
    assert.match(result.stdout, /warnings<=1/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('质量门禁应识别旧版 content-report 字段', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-quality-gate-'));
  try {
    await writeFile(
      path.join(root, 'content-report.json'),
      JSON.stringify({
        schemaVersion: 1,
        generatedAt: '2026-08-26T00:00:00.000Z',
        postCount: 2,
        errors: 0,
        warnings: 0,
        issues: [],
      })
    );
    const result = runGate(root, ['--report', 'content-report.json', '--no-annotations']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /content-check: 2 项/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
