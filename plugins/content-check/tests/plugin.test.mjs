import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { pluginContentCheck } from '../dist/index.js';

function createPost(filePath, route) {
  return {
    title: '测试文章',
    description: '用于测试内容诊断插件。',
    filePath,
    route,
    createDate: '2026-08-24',
    updateDate: '2026-08-24',
    url: route,
  };
}

function createConfig(root, post, content) {
  return {
    root,
    cwd: root,
    contentCheck: {
      enabled: true,
      reportPath: 'content-report.json',
      requiredFields: ['title', 'date'],
      checkImages: false,
    },
    buildContext: {
      root,
      cwd: root,
      contentIndex: {
        async getPosts() {
          return [post];
        },
        async getPostContent() {
          return content;
        },
      },
    },
  };
}

test('内容诊断插件应生成通过报告', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const filePath = path.join(root, 'post.md');
  await writeFile(filePath, '---\ntitle: 测试文章\ndate: 2026-08-24\n---\n正文内容\n', 'utf8');

  try {
    const post = createPost(filePath, '/posts/test');
    const plugin = pluginContentCheck(createConfig(root, post, '正文内容'));
    assert.ok(plugin);

    await plugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });
    await plugin.afterBuild();

    const report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.reportType, 'content-check');
    assert.equal(report.itemCount, 1);
    assert.equal(report.postCount, 1);
    assert.equal(report.errors, 0);
    assert.equal(report.warnings, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('failOnError 应在缺少必填字段时阻断构建', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const filePath = path.join(root, 'post.md');
  await writeFile(filePath, '---\ntitle: 测试文章\n---\n正文内容\n', 'utf8');

  try {
    const post = createPost(filePath, '/posts/test');
    const config = createConfig(root, post, '正文内容');
    config.contentCheck.failOnError = true;
    const plugin = pluginContentCheck(config);
    assert.ok(plugin);

    await assert.rejects(
      plugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } }),
      /已根据配置阻断构建/
    );

    const report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.errors, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('内容诊断插件应报告不存在的本地链接', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const filePath = path.join(root, 'post.md');
  await writeFile(filePath, '---\ntitle: 测试文章\ndate: 2026-08-24\n---\n正文内容\n', 'utf8');

  try {
    const post = createPost(filePath, '/posts/test');
    const plugin = pluginContentCheck(createConfig(root, post, '[不存在](./missing.md)'));
    assert.ok(plugin);

    await plugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });
    const report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.errors, 0);
    assert.equal(report.warnings, 1);
    assert.equal(report.issues[0].code, 'missing-link');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('内容诊断插件应捕获索引跳过的 Frontmatter 解析错误', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const filePath = path.join(root, 'post.md');
  const postsDir = path.join(root, 'posts');
  const brokenPath = path.join(postsDir, 'broken.md');
  await writeFile(filePath, '---\ntitle: 测试文章\ndate: 2026-08-24\n---\n正文内容\n', 'utf8');
  await mkdir(postsDir, { recursive: true });
  await writeFile(brokenPath, '---\ntitle: [broken\n---\n正文内容\n', 'utf8');

  try {
    const post = createPost(filePath, '/posts/test');
    const config = createConfig(root, post, '正文内容');
    config.posts = { dir: 'posts' };
    const plugin = pluginContentCheck(config);
    assert.ok(plugin);

    await plugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });
    const report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.errors, 1);
    assert.equal(report.issues[0].code, 'invalid-frontmatter');
    assert.equal(report.issues[0].filePath, brokenPath);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('内容诊断插件应支持规则级别覆盖和问题忽略', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const filePath = path.join(root, 'post.md');
  await writeFile(filePath, '---\ntitle: 测试文章\ndate: 2026-08-24\n---\n正文内容\n', 'utf8');

  try {
    const post = createPost(filePath, '/posts/test');
    const promotedConfig = createConfig(root, post, '[不存在](./missing.md)');
    promotedConfig.contentCheck.severity = { 'missing-link': 'error' };
    const promotedPlugin = pluginContentCheck(promotedConfig);
    assert.ok(promotedPlugin);
    await promotedPlugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });

    let report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.errors, 1);
    assert.equal(report.warnings, 0);

    const ignoredConfig = createConfig(root, post, '[不存在](./missing.md)');
    ignoredConfig.contentCheck.ignores = [{ code: 'missing-link', route: '/posts/test' }];
    const ignoredPlugin = pluginContentCheck(ignoredConfig);
    assert.ok(ignoredPlugin);
    await ignoredPlugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });

    report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.errors, 0);
    assert.equal(report.warnings, 0);
    assert.equal(report.issues.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('内容诊断插件应检查统一内容索引中的普通文档', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-check-'));
  const postPath = path.join(root, 'posts', 'test.md');
  const documentPath = path.join(root, 'content', 'guides', 'start.md');
  await mkdir(path.dirname(postPath), { recursive: true });
  await mkdir(path.dirname(documentPath), { recursive: true });
  await writeFile(postPath, '---\ntitle: 测试文章\ndate: 2026-08-24\n---\n正文内容\n', 'utf8');
  await writeFile(documentPath, '---\ntitle: 开始指南\n---\n文档正文\n', 'utf8');

  try {
    const post = { ...createPost(postPath, '/posts/test'), kind: 'post' };
    const document = {
      kind: 'document',
      title: '开始指南',
      filePath: documentPath,
      route: '/guides/start',
      updateDate: '2026-08-24T00:00:00.000Z',
      url: '/guides/start',
    };
    const config = createConfig(root, post, '正文内容');
    config.contentDir = 'content';
    config.buildContext.contentIndex.getEntries = async () => [post, document];
    config.buildContext.contentIndex.getPostContent = async (filePath) =>
      filePath === documentPath ? '[不存在](./missing.md)' : '正文内容';
    const plugin = pluginContentCheck(config);
    assert.ok(plugin);

    await plugin.beforeBuild({ output: { path: path.join(root, 'doc_build') } });
    const report = JSON.parse(
      await readFile(path.join(root, 'doc_build', 'content-report.json'), 'utf8')
    );
    assert.equal(report.itemCount, 2);
    assert.equal(report.postCount, 2);
    assert.equal(report.errors, 0);
    assert.equal(report.warnings, 1);
    assert.equal(report.issues[0].route, '/guides/start');
    assert.equal(report.issues[0].code, 'missing-link');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
