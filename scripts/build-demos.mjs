import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const demosRoot = path.join(repositoryRoot, 'demos');

function getDemos() {
  return readdirSync(demosRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(demosRoot, entry.name))
    .filter((directory) => existsSync(path.join(directory, 'package.json')))
    .map((directory) => ({
      directory,
      manifest: JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8')),
    }))
    .filter(({ manifest }) => manifest.name?.startsWith('@cogita/demo-'))
    .sort((first, second) => first.manifest.name.localeCompare(second.manifest.name));
}

const demos = getDemos();
if (demos.length === 0) {
  throw new Error('未找到主题 Demo。');
}

for (const { directory, manifest } of demos) {
  console.log(`\n构建 ${manifest.name}`);
  const result = spawnSync('pnpm', ['--filter', manifest.name, 'build'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  const output = path.join(directory, 'doc_build', 'index.html');
  if (!existsSync(output)) {
    throw new Error(`${manifest.name} 未生成 doc_build/index.html。`);
  }
}

console.log(`\n已构建 ${demos.length} 个主题 Demo。`);
