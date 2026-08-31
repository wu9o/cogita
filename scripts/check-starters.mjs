import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '..');
const starterRoot = path.join(repositoryRoot, 'starters');
const workspaceModules = path.join(repositoryRoot, 'node_modules/.pnpm/node_modules');
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'cogita-starter-check-'));

function runBuild(cwd) {
  return spawnSync(path.join(workspaceModules, '.bin/rslib'), ['build'], {
    cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  });
}

async function verifyStarter(name, expectedFiles) {
  const projectRoot = path.join(tempRoot, 'starters', name);
  await cp(path.join(starterRoot, name), projectRoot, { recursive: true });

  const result = runBuild(projectRoot);
  assert.equal(result.status, 0, `${name} starter 构建失败`);

  for (const relativePath of expectedFiles) {
    const filePath = path.join(projectRoot, relativePath);
    const content = await readFile(filePath, 'utf8');
    assert.ok(content.length > 0, `${name} starter 产物为空：${relativePath}`);
  }
}

try {
  await symlink(workspaceModules, path.join(tempRoot, 'node_modules'), 'dir');
  await symlink(path.join(repositoryRoot, 'scripts'), path.join(tempRoot, 'scripts'), 'dir');
  await verifyStarter('plugin', ['dist/index.js', 'dist/index.d.ts']);
  await verifyStarter('theme', ['dist/index.js', 'dist/index.d.ts', 'dist/theme.css']);
  console.log('[Starter Check] 第三方插件与主题 starter 构建通过');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
