import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
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

async function linkConsumerDependencies(projectRoot) {
  const nodeModules = path.join(projectRoot, 'node_modules');
  const cogitaModules = path.join(nodeModules, '@cogita');
  await mkdir(path.join(nodeModules, '.pnpm'), { recursive: true });
  await mkdir(cogitaModules, { recursive: true });
  await symlink(workspaceModules, path.join(nodeModules, '.pnpm/node_modules'), 'dir');

  const packageNames = new Set(await readdir(path.join(workspaceModules, '@cogita')));
  packageNames.add('plugin-content-source-git');
  const packageDirectories = Object.fromEntries(
    [...packageNames].map((packageName) => [
      packageName,
      packageName === 'plugin-content-source-git'
        ? path.join(repositoryRoot, 'plugins/content-source-git')
        : path.join(workspaceModules, '@cogita', packageName),
    ])
  );
  for (const [packageName, packageDirectory] of Object.entries(packageDirectories)) {
    await symlink(packageDirectory, path.join(cogitaModules, packageName), 'dir');
  }
}

async function verifyTemplate(template, expectedTheme, expectedContentSource) {
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
  if (expectedContentSource) {
    assert.equal(
      packageJson.devDependencies['@cogita/plugin-content-source-git'] !== undefined,
      true
    );
    assert.equal(config.includes('createGitContentSource'), true);
    const workflow = await readFile(path.join(projectRoot, '.github/workflows/deploy.yml'), 'utf8');
    assert.equal(workflow.includes('COGITA_CONTENT_REPOSITORY'), true);
    assert.equal(workflow.includes('pnpm exec cogita doctor --strict --json'), true);
    await writeFile(
      path.join(projectRoot, 'git-content', 'external-note.md'),
      '---\ntitle: 外部模板笔记\ntags: [外部内容]\n---\n\n这篇页面来自外部内容仓库。\n'
    );
  }

  await linkConsumerDependencies(projectRoot);
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
  if (expectedContentSource) {
    const externalPage = await readFile(
      path.join(projectRoot, 'doc_build/notes/external-note.html'),
      'utf8'
    );
    assert.equal(externalPage.includes('外部模板笔记'), true);
    assert.equal(externalPage.includes('来自外部内容仓库'), true);
  }
}

try {
  await verifyTemplate('blog', 'lucid');
  await verifyTemplate('docs', 'docs');
  await verifyTemplate('knowledge', 'knowledge');
  await verifyTemplate('knowledge-external', 'knowledge', true);
  console.log('[Template Check] blog/docs/knowledge/knowledge-external 模板创建与构建通过');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
