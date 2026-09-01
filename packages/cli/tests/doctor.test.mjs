import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve('bin/cogita.js');
const docsRoot = path.resolve('../../docs-site');

async function runDoctor(cwd, ...args) {
  try {
    const result = await execFileAsync(process.execPath, [cliPath, 'doctor', ...args], { cwd });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      code: error.code,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

test('doctor 应通过真实 docs-site 的配置、依赖和主题检查', async () => {
  const result = await runDoctor(docsRoot, '--json');
  assert.equal(result.code, 0);

  const report = JSON.parse(result.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.ok, true);
  assert.equal(report.errors, 0);
  assert.ok(report.checks.some((check) => check.code === 'COGITA_DOCTOR_THEME_OK'));
});

test('doctor --strict 应通过使用 workspace lockfile 的真实 docs-site', async () => {
  const result = await runDoctor(docsRoot, '--strict', '--json');
  assert.equal(result.code, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.warnings, 0);
  assert.ok(
    report.checks.some(
      (check) => check.code === 'COGITA_DOCTOR_LOCKFILE_OK' && check.details?.scope === 'workspace'
    )
  );
});

test('doctor 应为缺少配置的目录输出稳定错误码', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-doctor-missing-'));
  try {
    const result = await runDoctor(root, '--json');
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ok, false);
    assert.equal(report.checks[0].code, 'COGITA_DOCTOR_CONFIG_NOT_FOUND');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
