import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoots = ['packages', 'plugins', 'themes'];

/** 获取当前工作区中需要一起验证的发布包。 */
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

/** 为当前工作区包生成 tarball，并返回包名到文件路径的映射。 */
function packWorkspacePackages(packageDirectories, packageCache) {
  const archives = new Map();
  for (const packageDirectory of packageDirectories) {
    const manifest = JSON.parse(readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'));
    const output = spawnSync('pnpm', ['pack', '--pack-destination', packageCache], {
      cwd: packageDirectory,
      encoding: 'utf8',
    });
    if (output.status !== 0) {
      throw new Error(`${manifest.name} 打包失败：${output.stderr || output.stdout}`);
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

/** 创建只依赖发布 tarball 的最小博客项目。 */
function createConsumerProject(consumerRoot, archives) {
  const dependencies = Object.fromEntries(
    ['@cogita/cli', '@cogita/core', '@cogita/theme-lucid'].map((name) => [
      name,
      `file:${archives.get(name)}`,
    ])
  );
  const overrides = Object.fromEntries(
    Array.from(archives, ([name, archivePath]) => [name, `file:${archivePath}`])
  );
  writeFileSync(
    path.join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'cogita-package-consumer-smoke',
        private: true,
        type: 'module',
        dependencies,
        // 强制传递依赖也使用本次打包的本地 tarball，避免未发布版本回退到 registry。
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
  site: { title: 'Package Consumer Smoke Test', description: '测试发布包安装边界' },
  theme: '@cogita/theme-lucid',
  posts: { dir: 'posts', routePrefix: 'posts', extensions: ['md'] },
});
`
  );
  writeFileSync(
    path.join(consumerRoot, 'posts', 'hello.md'),
    `---
title: 发布包消费者测试
date: 2026-08-25
description: 验证独立项目安装发布包后可以生成文章页面。
---

# 发布包消费者测试

这是一篇用于验证 npm tarball 消费边界的最小文章。
`
  );
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'cogita-consumer-smoke-'));
const packageCache = path.join(tempRoot, 'packages');
const consumerRoot = path.join(tempRoot, 'consumer');
try {
  const packageDirectories = getPackageDirectories();
  const archives = packWorkspacePackages(packageDirectories, packageCache);
  mkdirSync(path.join(consumerRoot, 'posts'), { recursive: true });
  createConsumerProject(consumerRoot, archives);

  const install = spawnSync('pnpm', ['install', '--prefer-offline', '--ignore-scripts'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (install.status !== 0) {
    throw new Error('消费者项目安装 tarball 依赖失败。');
  }

  const build = spawnSync('pnpm', ['exec', 'cogita', 'build'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (build.status !== 0) {
    throw new Error('消费者项目使用发布 tarball 构建失败。');
  }

  const expectedFiles = ['doc_build/index.html', 'doc_build/posts/hello.html'];
  for (const relativePath of expectedFiles) {
    const absolutePath = path.join(consumerRoot, relativePath);
    try {
      readFileSync(absolutePath);
    } catch {
      throw new Error(`消费者项目缺少构建产物：${relativePath}`);
    }
  }
  console.log('[Consumer Smoke] 发布 tarball 安装、构建和文章路由验证通过');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
