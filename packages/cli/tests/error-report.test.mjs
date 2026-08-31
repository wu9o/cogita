import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve('bin/cogita.js');

async function runCli(cwd) {
  try {
    await execFileAsync(process.execPath, [cliPath, 'build'], { cwd });
    return { code: 0, output: '' };
  } catch (error) {
    return {
      code: error.code,
      output: `${error.stdout || ''}${error.stderr || ''}`,
    };
  }
}

describe('CLI 构建错误提示', () => {
  it('首次构建缺少配置时应输出错误码和初始化提示', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-cli-first-build-'));
    const result = await runCli(root);

    assert.equal(result.code, 1);
    assert.match(result.output, /COGITA_CONFIG_NOT_FOUND/);
    assert.match(result.output, /@cogita\/cli create/);
    assert.doesNotMatch(result.output, /UnhandledPromiseRejection|at async/);
  });

  it('主题包不存在时应输出统一主题诊断', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-cli-theme-error-'));
    await writeFile(
      path.join(root, 'cogita.config.ts'),
      "export default { theme: '@cogita/theme-does-not-exist' };\n"
    );
    const result = await runCli(root);

    assert.equal(result.code, 1);
    assert.match(result.output, /COGITA_THEME_LOAD_FAILED/);
    assert.match(result.output, /主题包已安装/);
    assert.doesNotMatch(result.output, /UnhandledPromiseRejection|at async/);
  });

  it('配置语法错误应输出稳定错误码而不泄露异步堆栈', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-cli-config-error-'));
    await writeFile(path.join(root, 'cogita.config.ts'), 'export default { theme: ; }\n');
    const result = await runCli(root);

    assert.equal(result.code, 1);
    assert.match(result.output, /COGITA_CONFIG_LOAD_FAILED/);
    assert.match(result.output, /请检查 cogita\.config\.ts/);
    assert.doesNotMatch(result.output, /UnhandledPromiseRejection|at async/);
  });
});
