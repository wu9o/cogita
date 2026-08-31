import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '..');
const cliPath = path.join(repositoryRoot, 'packages/cli/bin/cogita.js');
const workspaceModules = path.join(repositoryRoot, 'node_modules/.pnpm/node_modules');
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'cogita-template-check-'));

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  });
}

async function verifyTemplate(template, expectedTheme) {
  const projectRoot = path.join(tempRoot, `${template}-site`);
  const createResult = runCli(
    ['create', projectRoot, '--template', template, '--no-install', '--no-git'],
    repositoryRoot
  );
  assert.equal(createResult.status, 0, `${template} 模板创建失败`);

  const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.devDependencies[`@cogita/theme-${expectedTheme}`] !== undefined, true);
  const config = await readFile(path.join(projectRoot, 'cogita.config.ts'), 'utf8');
  assert.equal(config.includes(`@cogita/theme-${expectedTheme}`), true);
  assert.equal(config.includes('__SITE_TITLE__'), false);

  await symlink(workspaceModules, path.join(projectRoot, 'node_modules'), 'dir');
  const buildResult = runCli(['build'], projectRoot);
  assert.equal(buildResult.status, 0, `${template} 模板构建失败`);

  const doctorResult = spawnSync(process.execPath, [cliPath, 'doctor', '--json'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  assert.equal(doctorResult.status, 0, `${template} 模板 doctor 失败：${doctorResult.stderr}`);
  assert.equal(JSON.parse(doctorResult.stdout).ok, true);

  const indexPath = path.join(projectRoot, 'doc_build/index.html');
  assert.equal((await readFile(indexPath, 'utf8')).length > 0, true);
}

try {
  await verifyTemplate('blog', 'lucid');
  await verifyTemplate('docs', 'docs');
  console.log('[Template Check] blog/docs 模板创建与构建通过');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
