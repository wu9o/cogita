import { spawnSync } from 'node:child_process';
import {
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
const packageRoots = ['packages', 'plugins', 'themes'];
const requiredPackages = ['@cogita/cli', '@cogita/core', '@cogita/theme-knowledge'];

/** 获取当前工作区中可以参与独立消费者验证的发布包。 */
function getPackageDirectories() {
  return packageRoots.flatMap((rootName) => {
    const root = path.join(repositoryRoot, rootName);
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name))
      .filter((directory) => existsSync(path.join(directory, 'package.json')));
  });
}

/** 将当前工作区包打成 tarball，避免测试意外消费旧 registry 版本。 */
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

/** 创建同时包含文章和普通文档的知识库消费者。 */
function createConsumerProject(consumerRoot, archives, base) {
  const dependencies = Object.fromEntries(
    requiredPackages.map((name) => [name, `file:${archives.get(name)}`])
  );
  const overrides = Object.fromEntries(
    Array.from(archives, ([name, archivePath]) => [name, `file:${archivePath}`])
  );
  writeFileSync(
    path.join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'cogita-knowledge-consumer-smoke',
        private: true,
        type: 'module',
        scripts: {
          build: 'cogita build',
          doctor: 'cogita doctor',
        },
        dependencies,
        pnpm: { overrides },
      },
      null,
      2
    )}\n`
  );
  writeFileSync(
    path.join(consumerRoot, 'cogita.config.ts'),
    `import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'Knowledge Consumer Smoke',
    description: '文章和文档的统一知识库消费者。',
    base: '${base}',
  },
  posts: { dir: 'posts', routePrefix: 'posts', extensions: ['md'] },
  contentDir: 'content',
  contentCheck: {
    enabled: true,
    reportPath: 'content-report.json',
    checkImages: false,
    checkLinks: true,
  },
  theme: '@cogita/theme-knowledge',
});
`
  );
  writeFileSync(
    path.join(consumerRoot, 'posts', 'hello.md'),
    `---
title: 消费者文章
date: 2026-08-29
tags: [实践]
---

这是一篇链接到文档的文章。

[开始指南](/guides/start)
`
  );
  writeFileSync(
    path.join(consumerRoot, 'content', 'index.md'),
    `---
title: 知识库首页
tags: [知识库]
---

这是知识库首页。
`
  );
  writeFileSync(
    path.join(consumerRoot, 'content', 'guides', 'start.md'),
    `---
title: 开始指南
tags: [实践]
---

这是一个可被文章反向链接的文档。

[尚未完成的页面](/guides/missing)
`
  );
}

/** 执行一次独立消费者构建并返回关键首页内容。 */
function buildConsumer(consumerRoot, label) {
  const build = spawnSync('pnpm', ['exec', 'cogita', 'build'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (build.status !== 0) {
    throw new Error(`独立知识库消费者${label}构建失败。`);
  }

  const expectedFiles = [
    'doc_build/index.html',
    'doc_build/posts/hello.html',
    'doc_build/guides/start.html',
    'doc_build/search.html',
    'doc_build/tags.html',
    'doc_build/content-report.json',
  ];
  for (const relativePath of expectedFiles) {
    if (!existsSync(path.join(consumerRoot, relativePath))) {
      throw new Error(`独立知识库消费者缺少${label}构建产物：${relativePath}`);
    }
  }

  return readFileSync(path.join(consumerRoot, 'doc_build/index.html'), 'utf8');
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'cogita-knowledge-consumer-'));
const packageCache = path.join(tempRoot, 'packages');
const consumerRoot = path.join(tempRoot, 'consumer');

try {
  mkdirSync(packageCache, { recursive: true });
  mkdirSync(path.join(consumerRoot, 'posts'), { recursive: true });
  mkdirSync(path.join(consumerRoot, 'content', 'guides'), { recursive: true });
  const archives = packWorkspacePackages(getPackageDirectories(), packageCache);
  createConsumerProject(consumerRoot, archives, '/knowledge/');

  const install = spawnSync(
    'pnpm',
    ['install', '--store-dir', path.join(tempRoot, 'store'), '--ignore-scripts'],
    { cwd: consumerRoot, encoding: 'utf8', stdio: 'inherit' }
  );
  if (install.status !== 0) {
    throw new Error('独立知识库消费者安装发布包失败。');
  }

  const doctor = spawnSync('pnpm', ['exec', 'cogita', 'doctor', '--strict', '--json'], {
    cwd: consumerRoot,
    encoding: 'utf8',
  });
  if (doctor.status !== 0) {
    throw new Error(`独立知识库消费者 doctor 失败：${doctor.stderr || doctor.stdout}`);
  }
  const doctorReport = JSON.parse(doctor.stdout);
  if (!doctorReport.ok || doctorReport.errors !== 0 || doctorReport.warnings !== 0) {
    throw new Error(`独立知识库消费者 doctor 报告未通过：${doctor.stdout}`);
  }

  const subpathIndexHtml = buildConsumer(consumerRoot, '子路径');
  if (!subpathIndexHtml.includes('/knowledge/')) {
    throw new Error('独立知识库消费者子路径构建未生成 /knowledge/ 基础路径。');
  }

  const contentReport = JSON.parse(
    readFileSync(path.join(consumerRoot, 'doc_build/content-report.json'), 'utf8')
  );
  if (
    contentReport.itemCount !== 3 ||
    contentReport.errors !== 0 ||
    !contentReport.issues.some(
      (issue) => issue.code === 'missing-link' && issue.route === '/guides/start'
    )
  ) {
    throw new Error(`统一内容断链诊断结果不符合预期：${JSON.stringify(contentReport)}`);
  }

  createConsumerProject(consumerRoot, archives, '/');
  const rootIndexHtml = buildConsumer(consumerRoot, '根路径');

  if (!rootIndexHtml.includes('消费者文章') || !rootIndexHtml.includes('开始指南')) {
    throw new Error('知识库首页未同时包含文章和文档入口。');
  }
  console.log(
    '[Knowledge Consumer Smoke] doctor 严格检查、根路径/子路径构建、文章文档统一索引和断链诊断验证通过'
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
