import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '..');
const blogRoot = path.resolve(
  process.env.COGITA_BLOG_DIR || path.join(repositoryRoot, '..', 'cogita-blog')
);
const port = process.env.PORT || process.argv[2] || '3034';

async function createPreviewProject() {
  const previewRoot = await mkdtemp(path.join(os.tmpdir(), 'cogita-lucid-preview-'));
  const sourceConfigPath = path.join(blogRoot, 'cogita.config.ts');
  const sourceConfig = await readFile(sourceConfigPath, 'utf8');
  const localConfig = sourceConfig
    .replaceAll("theme: '@cogita/theme-editorial'", "theme: '@cogita/theme-lucid'")
    .replaceAll("base: '/cogita-blog/'", "base: '/'")
    .replaceAll('https://wu9o.github.io/cogita-blog/', `http://localhost:${port}/`)
    .replaceAll('/cogita-blog/', '/');

  await Promise.all([
    cp(path.join(blogRoot, 'posts'), path.join(previewRoot, 'posts'), { recursive: true }),
    cp(path.join(blogRoot, 'public'), path.join(previewRoot, 'public'), { recursive: true }),
    writeFile(path.join(previewRoot, 'cogita.config.ts'), localConfig),
    writeFile(
      path.join(previewRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'cogita-lucid-preview',
          private: true,
          type: 'module',
          devDependencies: {
            '@cogita/cli': 'workspace:*',
            '@cogita/core': 'workspace:*',
            '@cogita/theme-lucid': 'workspace:*',
          },
        },
        null,
        2
      )
    ),
  ]);

  await symlink(
    path.join(repositoryRoot, 'node_modules/.pnpm/node_modules'),
    path.join(previewRoot, 'node_modules'),
    'dir'
  );

  return previewRoot;
}

const result = spawnSync('pnpm', ['run', 'build:packages'], {
  cwd: repositoryRoot,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const previewRoot = await createPreviewProject();
const cliPath = path.join(repositoryRoot, 'packages/cli/bin/cogita.js');

const buildResult = spawnSync(process.execPath, [cliPath, 'build'], {
  cwd: previewRoot,
  stdio: 'inherit',
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

console.log(`[Lucid] 使用独立博客仓库内容预览：${blogRoot}`);
console.log(`[Lucid] 本地地址：http://localhost:${port}/`);

const server = spawn(process.execPath, [cliPath, 'preview', '--port', String(port)], {
  cwd: previewRoot,
  stdio: 'inherit',
});

const stop = (signal) => {
  server.kill(signal);
};

process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));

server.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
