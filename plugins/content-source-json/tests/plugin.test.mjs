import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createJsonContentSource } from '../dist/index.js';

const logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

test('JSON 内容源应读取数组、生成稳定标识并提供正文', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-json-source-'));
  const file = path.join(root, 'export.json');
  await writeFile(
    file,
    JSON.stringify([
      {
        id: 'remote-note',
        kind: 'document',
        title: '远程笔记',
        route: '/notes/remote-note',
        updateDate: '2026-08-25T00:00:00.000Z',
        tags: ['研究'],
        content: '# 远程笔记\n\n正文',
      },
    ]),
    'utf8'
  );

  try {
    const source = createJsonContentSource({ file: 'export.json', id: 'research-notes' });
    const entries = await source.load({ root, cwd: root, logger });
    assert.equal(source.id, 'research-notes');
    assert.equal(entries.length, 1);
    assert.equal(entries[0].sourceId, undefined);
    assert.equal(entries[0].filePath, 'source://research-notes/remote-note');
    assert.equal(entries[0].url, undefined);
    assert.equal(
      await source.getContent({ ...entries[0], url: entries[0].route }),
      '# 远程笔记\n\n正文'
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('JSON 内容源应支持 entries 对象并拒绝无效文章', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-json-source-'));
  const file = path.join(root, 'export.json');
  await writeFile(
    file,
    JSON.stringify({
      entries: [{ kind: 'post', title: '缺日期', route: '/bad', updateDate: '2026-08-25' }],
    }),
    'utf8'
  );

  try {
    const source = createJsonContentSource({ file: 'export.json' });
    await assert.rejects(
      source.load({ root, cwd: root, logger }),
      /缺少 kind、title、route、updateDate 或 createDate/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('JSON 内容源应在构建期读取远程快照并传递请求头', async () => {
  let authorization;
  const server = createServer((request, response) => {
    authorization = request.headers.authorization;
    response.setHeader('content-type', 'application/json');
    response.end(
      JSON.stringify({
        entries: [
          {
            id: 'api-note',
            kind: 'document',
            title: 'API 笔记',
            route: '/notes/api-note',
            updateDate: '2026-08-26T00:00:00.000Z',
            content: '# API 笔记\n\n来自远程快照',
          },
        ],
      })
    );
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const source = createJsonContentSource({
      id: 'api-notes',
      url: `http://127.0.0.1:${address.port}/notes.json`,
      headers: { Authorization: 'Bearer test-token' },
      timeoutMs: 1_000,
    });
    const entries = await source.load({ root: process.cwd(), cwd: process.cwd(), logger });

    assert.equal(authorization, 'Bearer test-token');
    assert.equal(entries[0].filePath, 'source://api-notes/api-note');
    assert.equal(
      await source.getContent({ ...entries[0], url: entries[0].route }),
      '# API 笔记\n\n来自远程快照'
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('JSON 内容源应拒绝冲突配置和无效超时', () => {
  assert.throws(
    () => createJsonContentSource({ file: 'export.json', url: 'https://example.com/export.json' }),
    /file 和 url 必须二选一/
  );
  assert.throws(() => createJsonContentSource({}), /file 和 url 必须二选一/);
  assert.throws(
    () => createJsonContentSource({ url: 'https://example.com/export.json', timeoutMs: 0 }),
    /timeoutMs 必须是正数/
  );
});
