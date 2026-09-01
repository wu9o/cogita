import assert from 'node:assert/strict';
import test from 'node:test';
import { createContentSourcePagesPlugin } from '../dist/es/index.js';

test('Core 应为有正文的外部内容源生成静态页面', async () => {
  const contentIndex = {
    async getEntries() {
      return [
        {
          sourceId: 'notes',
          filePath: 'source://notes/architecture',
          route: '/notes/architecture',
          kind: 'document',
          title: '架构笔记',
          updateDate: '2026-09-01T00:00:00.000Z',
        },
      ];
    },
    async getPostContent(filePath) {
      assert.equal(filePath, 'source://notes/architecture');
      return '---\ntitle: 架构笔记\n---\n\n来自独立内容源。';
    },
  };
  const plugin = createContentSourcePagesPlugin({
    root: '/tmp/cogita-content-source-pages',
    cwd: '/tmp/cogita-content-source-pages',
    buildContext: { contentIndex },
  });

  await plugin.beforeBuild();

  assert.deepEqual(plugin.addPages(), [
    {
      routePath: '/notes/architecture',
      content: '---\ntitle: 架构笔记\n---\n\n来自独立内容源。',
    },
  ]);
});

test('Core 应跳过没有可读取正文的外部条目', async () => {
  const plugin = createContentSourcePagesPlugin({
    root: '/tmp/cogita-content-source-pages',
    cwd: '/tmp/cogita-content-source-pages',
    buildContext: {
      contentIndex: {
        async getEntries() {
          return [
            {
              sourceId: 'metadata-only',
              filePath: 'source://metadata-only/item',
              route: '/metadata-only/item',
              kind: 'document',
              title: '只有元数据',
              updateDate: '2026-09-01T00:00:00.000Z',
            },
          ];
        },
        async getPostContent() {
          throw new Error('没有 content 字段');
        },
      },
    },
  });

  await plugin.beforeBuild();

  assert.deepEqual(plugin.addPages(), []);
});
