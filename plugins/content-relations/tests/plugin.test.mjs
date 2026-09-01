import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pluginContentRelations } from '../dist/index.js';

function createContentIndex() {
  const posts = [
    {
      title: '首页',
      route: '/posts/index',
      url: '/posts/index',
      filePath: '/tmp/cogita-relations/posts/index.md',
      createDate: '2026-08-01',
      updateDate: '2026-08-01',
    },
    {
      title: '目标文章',
      route: '/posts/target',
      url: '/posts/target',
      filePath: '/tmp/cogita-relations/posts/target.md',
      createDate: '2026-08-02',
      updateDate: '2026-08-02',
    },
  ];
  const contents = new Map([
    [posts[0].filePath, '[目标文章](./target.md)'],
    [posts[1].filePath, '没有出链'],
  ]);

  return {
    contractVersion: 1,
    getPosts: async () => posts,
    getPostContent: async (filePath) => contents.get(filePath) || '',
  };
}

function createUnifiedContentIndex() {
  const posts = createContentIndex();
  const document = {
    kind: 'document',
    title: '知识库指南',
    route: '/guides/start',
    url: '/guides/start',
    filePath: '/tmp/cogita-relations/content/guides/start.md',
    updateDate: '2026-08-03',
  };

  return {
    ...posts,
    getEntries: async () => [
      ...(await posts.getPosts()).map((post) => ({ ...post, kind: 'post' })),
      document,
    ],
    getPostContent: async (filePath) =>
      filePath === document.filePath ? '[目标文章](/posts/target)' : posts.getPostContent(filePath),
  };
}

describe('内容关系插件能力契约', () => {
  it('未配置时应优雅跳过', () => {
    assert.equal(pluginContentRelations({ root: process.cwd(), cwd: process.cwd() }), null);
  });

  it('应声明内容关系能力和文章索引依赖', () => {
    const plugin = pluginContentRelations({
      root: '/tmp/cogita-relations',
      cwd: '/tmp/cogita-relations',
      posts: { dir: 'posts', extensions: ['md'] },
      contentRelations: { enabled: true },
      contentIndex: createContentIndex(),
    });

    assert.deepEqual(plugin?.cogita?.providesCapabilities, ['content.relations']);
    assert.deepEqual(plugin?.cogita?.requiresCapabilities, ['content.posts']);
  });

  it('应生成出链和反向链接运行时模块', async () => {
    const plugin = pluginContentRelations({
      root: '/tmp/cogita-relations',
      cwd: '/tmp/cogita-relations',
      posts: { dir: 'posts', extensions: ['md'] },
      contentRelations: { enabled: true },
      contentIndex: createContentIndex(),
    });

    await plugin.beforeBuild();
    const source = plugin.addRuntimeModules()['virtual-content-relations-data'];
    assert.match(source, /export const contentRelations/);
    assert.match(source, /目标文章/);
    assert.match(source, /getBacklinks/);
  });

  it('应使用统一内容条目生成文章到文档的关系', async () => {
    const plugin = pluginContentRelations({
      root: '/tmp/cogita-relations',
      cwd: '/tmp/cogita-relations',
      contentDir: 'content',
      posts: { dir: 'posts', extensions: ['md'] },
      contentRelations: { enabled: true },
      contentIndex: createUnifiedContentIndex(),
    });

    await plugin.beforeBuild();
    const source = plugin.addRuntimeModules()['virtual-content-relations-data'];
    assert.match(source, /知识库指南/);
    assert.match(source, /"kind":"document"/);
  });
});
