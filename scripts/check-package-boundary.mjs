import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const packageRoots = ['packages', 'plugins', 'themes'];

/** 获取工作区中需要发布的包目录。 */
function getPackageDirectories() {
  return packageRoots.flatMap((rootName) => {
    const root = path.join(repositoryRoot, rootName);
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name))
      .filter((directory) => {
        try {
          readFileSync(path.join(directory, 'package.json'), 'utf8');
          return true;
        } catch {
          return false;
        }
      });
  });
}

/** 从发布包清单中提取所有需要存在的入口文件。 */
function collectEntryPaths(manifest) {
  const entryPaths = new Set();
  const addEntry = (value) => {
    if (typeof value === 'string' && value.startsWith('./')) {
      entryPaths.add(value.slice(2));
    }
  };

  addEntry(manifest.main);
  addEntry(manifest.module);
  addEntry(manifest.types);

  const visitExports = (value) => {
    if (typeof value === 'string') {
      addEntry(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visitExports);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(visitExports);
    }
  };
  visitExports(manifest.exports);
  visitExports(manifest.bin);

  return entryPaths;
}

/** 检查单个包的发布清单是否已经脱离 workspace:*。 */
function checkPackage(packageDirectory, tempRoot) {
  const sourceManifest = JSON.parse(
    readFileSync(path.join(packageDirectory, 'package.json'), 'utf8')
  );
  const output = spawnSync('pnpm', ['pack', '--pack-destination', tempRoot], {
    cwd: packageDirectory,
    encoding: 'utf8',
  });
  if (output.status !== 0) {
    throw new Error(`${sourceManifest.name} 打包失败：${output.stderr || output.stdout}`);
  }

  const archiveName = readdirSync(tempRoot).find(
    (entry) =>
      entry.endsWith('.tgz') &&
      entry.startsWith(sourceManifest.name.replace(/^@/, '').replace('/', '-'))
  );
  if (!archiveName) {
    throw new Error(`${sourceManifest.name} 未生成 tarball。`);
  }

  const archivePath = path.join(tempRoot, archiveName);
  const manifest = JSON.parse(
    execFileSync('tar', ['-xOf', archivePath, 'package/package.json'], { encoding: 'utf8' })
  );
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies,
  };
  const workspaceDependencies = Object.entries(dependencies).filter(([, version]) =>
    String(version).startsWith('workspace:')
  );
  if (workspaceDependencies.length > 0) {
    throw new Error(
      `${manifest.name} 的发布清单仍包含 workspace 依赖：${workspaceDependencies
        .map(([name, version]) => `${name}@${version}`)
        .join(', ')}`
    );
  }

  const archiveEntries = new Set(
    execFileSync('tar', ['-tzf', archivePath], { encoding: 'utf8' }).split('\n').filter(Boolean)
  );
  for (const entryPath of collectEntryPaths(manifest)) {
    if (!archiveEntries.has(`package/${entryPath}`)) {
      throw new Error(`${manifest.name} 的入口文件未被打包：${entryPath}`);
    }
  }

  return manifest;
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'cogita-package-boundary-'));
let checked = 0;
try {
  for (const packageDirectory of getPackageDirectories()) {
    const manifest = checkPackage(packageDirectory, tempRoot);
    checked += 1;
    console.log(`[Package Boundary] ${manifest.name}@${manifest.version} 通过`);
  }
  console.log(`[Package Boundary] 已检查 ${checked} 个发布包`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
