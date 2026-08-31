import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const packageNames = ['@cogita/cli', '@cogita/core', '@cogita/theme-lucid'];
const requireDoctor = process.argv.includes('--require-doctor');

/** 获取 registry 当前可安装的公开版本。 */
function getPublishedVersion(packageName) {
  const result = spawnSync('pnpm', ['view', packageName, 'version', '--json'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`${packageName} registry 版本查询失败：${result.stderr || result.stdout}`);
  }

  const output = result.stdout.trim();
  const version = JSON.parse(output);
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(`${packageName} registry 版本格式无效：${output}`);
  }
  return version;
}

/** 写入只使用 registry 包的最小消费者项目。 */
function createConsumerProject(consumerRoot, versions) {
  writeFileSync(
    path.join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'cogita-registry-consumer-smoke',
        private: true,
        type: 'module',
        scripts: {
          build: 'cogita build',
          doctor: 'cogita doctor',
        },
        dependencies: {
          '@cogita/cli': versions['@cogita/cli'],
          '@cogita/core': versions['@cogita/core'],
          '@cogita/theme-lucid': versions['@cogita/theme-lucid'],
          react: '^18.3.1',
          'react-dom': '^18.3.1',
        },
      },
      null,
      2
    )}\n`
  );
  writeFileSync(
    path.join(consumerRoot, 'cogita.config.ts'),
    `import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: { title: 'Registry Consumer Smoke Test', description: '验证 registry 发布包消费边界' },
  theme: '@cogita/theme-lucid',
  posts: { dir: 'posts', routePrefix: 'posts', extensions: ['md'] },
});
`
  );
  writeFileSync(
    path.join(consumerRoot, 'posts', 'hello.md'),
    `---
title: Registry 发布包测试
date: 2026-08-25
description: 验证独立项目可以直接安装 registry 中的 Cogita 包。
---

# Registry 发布包测试

这是一篇用于验证公开 registry 消费路径的最小文章。
`
  );
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'cogita-registry-consumer-'));
const consumerRoot = path.join(tempRoot, 'consumer');
const storeRoot = path.join(tempRoot, 'store');
try {
  const versions = Object.fromEntries(
    packageNames.map((packageName) => [packageName, getPublishedVersion(packageName)])
  );
  mkdirSync(path.join(consumerRoot, 'posts'), { recursive: true });
  createConsumerProject(consumerRoot, versions);

  // 强制重新解析和下载，避免本机 store 中残留的未发布 tarball 掩盖版本错位。
  const install = spawnSync('pnpm', ['install', '--store-dir', storeRoot, '--ignore-scripts'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (install.status !== 0) {
    throw new Error('registry 消费者项目安装失败。');
  }

  const help = spawnSync('pnpm', ['exec', 'cogita', '--help'], {
    cwd: consumerRoot,
    encoding: 'utf8',
  });
  const hasDoctor = help.status === 0 && /\bdoctor\b/.test(help.stdout);
  if (requireDoctor && !hasDoctor) {
    throw new Error(`registry 中的 @cogita/cli 尚未提供 doctor 命令：${versions['@cogita/cli']}`);
  }
  if (hasDoctor) {
    const doctor = spawnSync('pnpm', ['run', 'doctor', '--', '--strict', '--json'], {
      cwd: consumerRoot,
      encoding: 'utf8',
    });
    if (doctor.status !== 0) {
      throw new Error(`registry 消费者 doctor 失败：${doctor.stderr || doctor.stdout}`);
    }
    const doctorReport = JSON.parse(doctor.stdout);
    if (!doctorReport.ok || doctorReport.errors !== 0 || doctorReport.warnings !== 0) {
      throw new Error(`registry 消费者 doctor 报告未通过：${doctor.stdout}`);
    }
  } else {
    console.log(
      `[Registry Consumer Smoke] @cogita/cli@${versions['@cogita/cli']} 尚未提供 doctor，兼容性检查跳过`
    );
  }

  const build = spawnSync('pnpm', ['exec', 'cogita', 'build'], {
    cwd: consumerRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (build.status !== 0) {
    throw new Error('registry 消费者项目构建失败。');
  }

  for (const relativePath of ['doc_build/index.html', 'doc_build/posts/hello.html']) {
    try {
      readFileSync(path.join(consumerRoot, relativePath));
    } catch {
      throw new Error(`registry 消费者项目缺少构建产物：${relativePath}`);
    }
  }
  console.log(
    `[Registry Consumer Smoke] ${packageNames.map((packageName) => `${packageName}@${versions[packageName]}`).join(', ')} 安装、构建和文章路由验证通过`
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
