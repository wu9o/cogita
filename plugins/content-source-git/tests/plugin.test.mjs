import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createGitContentSource } from '../dist/index.js';

const logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

test('Git 内容源应扫描独立目录、生成路由并提供正文', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-git-source-'));
  const directory = path.join(root, 'team-notes');
  await mkdir(path.join(directory, 'guides'), { recursive: true });
  await mkdir(path.join(directory, 'assets'), { recursive: true });
  await writeFile(
    path.join(directory, 'index.md'),
    '---\ntitle: 团队知识库\ntags: [研究]\n---\n# 团队知识库\n',
    'utf8'
  );
  await writeFile(
    path.join(directory, 'guides', 'start.mdx'),
    '---\ntitle: 开始指南\nupdateDate: 2026-08-27\n---\n开始正文\n\n![流程图](../assets/diagram.svg)\n',
    'utf8'
  );
  await writeFile(path.join(directory, 'assets', 'diagram.svg'), '<svg></svg>\n', 'utf8');

  try {
    const context = { root, cwd: root, logger };
    const earlySource = createGitContentSource({
      id: 'team-notes',
      directory: 'team-notes',
      routePrefix: 'notes',
    });
    const earlyAssets = await earlySource.getAssets(context);
    assert.equal(earlyAssets.length, 1);
    assert.match(
      await earlySource.getContent({ filePath: 'source://team-notes/guides/start.mdx' }, context),
      /\/external-content\/team-notes-[a-z0-9]+\/assets\/diagram\.svg/
    );

    const source = createGitContentSource({
      id: 'team-notes',
      directory: 'team-notes',
      routePrefix: 'notes',
    });
    const entries = await source.load(context);

    assert.deepEqual(
      entries.map((entry) => [entry.kind, entry.title, entry.route]),
      [
        ['document', '团队知识库', '/notes'],
        ['document', '开始指南', '/notes/guides/start'],
      ]
    );
    assert.deepEqual(entries[0].tags, ['研究']);
    assert.equal(
      (await source.getContent({ ...entries[1], url: entries[1].route }, context)).trim(),
      `---\ntitle: 开始指南\nupdateDate: 2026-08-27\n---\n开始正文\n\n![流程图](/${(await source.getAssets())[0].publicPath})`
    );
    const assets = await source.getAssets();
    assert.equal(assets.length, 1);
    assert.equal(assets[0].filePath, path.join(directory, 'assets', 'diagram.svg'));
    assert.match(
      assets[0].publicPath,
      /^external-content\/team-notes-[a-z0-9]+\/assets\/diagram\.svg$/
    );

    await writeFile(path.join(directory, 'assets', 'notes.txt'), '补充资料\n', 'utf8');
    await source.load(context);
    assert.equal((await source.getAssets(context)).length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Git 内容源应要求文章提供稳定创建时间并拒绝不存在的目录', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-git-source-'));
  const directory = path.join(root, 'posts');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'missing-date.md'), '# 缺日期\n', 'utf8');

  try {
    const source = createGitContentSource({ directory: 'posts', kind: 'post' });
    await assert.rejects(source.load({ root, cwd: root, logger }), /文章缺少 date 或 createDate/);
    const missing = createGitContentSource({ directory: 'missing' });
    await assert.rejects(missing.load({ root, cwd: root, logger }), /读取目录/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Git 内容源应拒绝空目录和空扩展名配置', () => {
  assert.throws(() => createGitContentSource({ directory: ' ' }), /directory 不能为空/);
  assert.throws(
    () => createGitContentSource({ directory: 'notes', extensions: [] }),
    /extensions 不能为空/
  );
});
