import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const docsRoot = path.join(repositoryRoot, 'docs-site');
const requiredPackages = ['@cogita/cli', '@cogita/core', '@cogita/theme-docs'];
const packageRoots = ['packages', 'plugins', 'themes'];

/** 获取当前仓库中可以参与独立消费者验证的发布包。 */
function getPackageDirectories() {
  return packageRoots.flatMap((rootName) => {
    const root = path.join(repositoryRoot, rootName);
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name))
      .filter((directory) => existsSync(path.join(directory, 'package.json')));
  });
}

/** 将当前工作区包打成 tarball，模拟已经发布到 registry 的包。 */
function packWorkspacePackages(packageDirectories, packageCache) {
  const archives = new Map();
  for (const packageDirectory of packageDirectories) {
    const manifest = JSON.parse(readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'));
    const result = spawnSync('pnpm', ['pack', '--pack-destination', packageCache], {
      cwd: packageDirectory,
      encoding: 'utf8',
    });
    if (result.status !== 0) {
      throw new Error(`${manifest.name} 打包失败：${result.stderr || result.stdout}`);
    }

    const archiveName = readdirSync(packageCache).find(
      (entry) =>
        entry.endsWith('.tgz') &&
        entry.startsWith(manifest.name.replace(/^@/, '').replace('/', '-'))
    );
    if (!archiveName) {
      throw new Error(`${manifest.name} 未生成 tarball。`);
    }
    archives.set(manifest.name, path.join(packageCache, archiveName));
  }
  return archives;
}

/** 创建技术手册的临时消费者副本，不修改当前仓库的 docs-site。 */
function createConsumerProject(consumerRoot, archives) {
  const manifest = JSON.parse(readFileSync(path.join(docsRoot, 'package.json'), 'utf8'));
  const localDependencies = Object.fromEntries(
    requiredPackages.map((name) => [name, `file:${archives.get(name)}`])
  );
  manifest.devDependencies = {
    ...manifest.devDependencies,
    ...localDependencies,
  };
  manifest.pnpm = {
    ...manifest.pnpm,
    overrides: Object.fromEntries(
      Array.from(archives, ([name, archivePath]) => [name, `file:${archivePath}`])
    ),
  };
  manifest.name = 'cogita-docs-consumer-smoke';

  writeFileSync(path.join(consumerRoot, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  for (const entry of ['cogita.config.ts', 'content']) {
    cpSync(path.join(docsRoot, entry), path.join(consumerRoot, entry), { recursive: true });
  }
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'cogita-docs-consumer-'));
const packageCache = path.join(tempRoot, 'packages');
const consumerRoot = path.join(tempRoot, 'consumer');

try {
  mkdirSync(packageCache, { recursive: true });
  mkdirSync(consumerRoot, { recursive: true });
  const archives = packWorkspacePackages(getPackageDirectories(), packageCache);
  createConsumerProject(consumerRoot, archives);

  const install = spawnSync(
    'pnpm',
    ['install', '--store-dir', path.join(tempRoot, 'store'), '--ignore-scripts'],
    { cwd: consumerRoot, encoding: 'utf8', stdio: 'inherit' }
  );
  if (install.status !== 0) {
    throw new Error('独立文档消费者安装发布包失败。');
  }

  const build = spawnSync('pnpm', ['exec', 'cogita', 'build'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (build.status !== 0) {
    throw new Error('独立文档消费者构建失败。');
  }

  const expectedFiles = [
    'doc_build/index.html',
    'doc_build/getting-started.html',
    'doc_build/themes.html',
    'doc_build/guides/index.html',
    'doc_build/api/architecture-design.html',
    'doc_build/plugins/plugin-api-specification.html',
  ];
  for (const relativePath of expectedFiles) {
    if (!existsSync(path.join(consumerRoot, relativePath))) {
      throw new Error(`独立文档消费者缺少构建产物：${relativePath}`);
    }
  }

  const indexHtml = readFileSync(path.join(consumerRoot, 'doc_build/index.html'), 'utf8');
  if (!indexHtml.includes('Cogita Documentation')) {
    throw new Error('独立文档消费者首页未包含文档站标题。');
  }
  console.log('[Docs Consumer Smoke] 独立文档站的发布包安装、构建和关键路由验证通过');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
