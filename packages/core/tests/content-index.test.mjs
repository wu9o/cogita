import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { getBlogListRouteEntries, getBlogListRoutes, getCogitaBuildContext } from '@cogita/shared';
import { createContentIndex, getDevWatchPaths, prepareContentDirectory } from '../dist/es/index.js';

describe('构建期内容索引', () => {
  it('应优先使用显式构建上下文，并兼容旧版平铺配置', () => {
    const contentIndex = { getPosts: async () => [] };
    const explicitContext = {
      root: '/project',
      cwd: '/project',
      contentIndex,
      themeLayouts: { blogList: '/theme/BlogList.js' },
    };

    assert.equal(
      getCogitaBuildContext({
        root: '/legacy',
        cwd: '/legacy',
        contentIndex: undefined,
        buildContext: explicitContext,
      }),
      explicitContext
    );

    const legacyContext = getCogitaBuildContext({
      root: '/legacy',
      cwd: '/legacy',
      contentIndex,
      strict: false,
    });
    assert.equal(legacyContext.root, '/legacy');
    assert.equal(legacyContext.contentIndex, contentIndex);
    assert.equal(legacyContext.strict, false);
  });

  it('开发服务器应监听文章、公共资源和配置文件', () => {
    assert.deepEqual(
      getDevWatchPaths(
        '/project',
        { posts: { dir: 'content/posts' } },
        '/project/cogita.config.ts'
      ),
      ['/project/content/posts', '/project/public', '/project/cogita.config.ts']
    );
  });

  it('文档站点应监听并复制显式配置的内容目录', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cogita-docs-'));
    const sourceDirectory = path.join(root, 'content');
    const targetDirectory = path.join(root, '.cogita_content');
    fs.mkdirSync(path.join(sourceDirectory, 'guides'), { recursive: true });
    fs.writeFileSync(path.join(sourceDirectory, 'index.md'), '# 文档首页\n');
    fs.writeFileSync(path.join(sourceDirectory, 'guides', 'start.md'), '# 开始\n');

    try {
      assert.deepEqual(getDevWatchPaths(root, { contentDir: 'content' }), [
        path.join(root, 'posts'),
        path.join(root, 'content'),
        path.join(root, 'public'),
      ]);

      await prepareContentDirectory(root, targetDirectory, 'content');
      assert.equal(fs.readFileSync(path.join(targetDirectory, 'index.md'), 'utf8'), '# 文档首页\n');
      assert.equal(
        fs.readFileSync(path.join(targetDirectory, 'guides', 'start.md'), 'utf8'),
        '# 开始\n'
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('应扫描文章、生成路由，并复用同一个索引 Promise', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cogita-content-index-'));
    const postsDir = path.join(root, 'articles');
    fs.mkdirSync(path.join(postsDir, 'guides'), { recursive: true });
    fs.writeFileSync(
      path.join(postsDir, 'index.md'),
      '---\ntitle: 首页文章\ndate: 2026-08-24\ntags: [构建]\n---\n正文\n'
    );
    fs.writeFileSync(
      path.join(postsDir, 'guides', 'first.mdx'),
      '---\ntitle: 指南文章\ndate: 2026-08-23\n---\n正文\n'
    );

    try {
      const index = createContentIndex(root, {
        dir: 'articles',
        routePrefix: 'posts',
        extensions: ['md', 'mdx'],
      });
      const firstRead = index.getPosts();
      const secondRead = index.getPosts();
      const posts = await firstRead;

      assert.strictEqual(firstRead, secondRead);
      assert.deepEqual(
        posts.map((post) => [post.title, post.route]),
        [
          ['首页文章', '/posts'],
          ['指南文章', '/posts/guides/first'],
        ]
      );
      assert.deepEqual(posts[0].tags, ['构建']);
      assert.equal(posts[0].url, '/posts');
      assert.equal((await index.getPostContent(posts[0].filePath)).trim(), '正文');

      fs.writeFileSync(
        path.join(postsDir, 'index.md'),
        '---\ntitle: 更新后的文章\ndate: 2026-08-24\ntags: [构建]\n---\n正文\n'
      );
      index.invalidate();
      const refreshedPosts = await index.getPosts();
      assert.equal(refreshedPosts[0].title, '更新后的文章');
      assert.equal((await index.getPostContent(refreshedPosts[0].filePath)).trim(), '正文');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('应为文章列表生成筛选路由，并让父分类覆盖子分类', () => {
    const posts = [
      { createDate: '2026-08-24', tags: ['Git'], categories: ['工程实践/Git'] },
      { createDate: '2026-08-23', tags: ['Git'], categories: ['工程实践/前端'] },
    ];
    const config = { pageSize: 1, categorySeparator: '/' };
    assert.deepEqual(getBlogListRoutes(posts, config), [
      '/archive',
      '/archive/page/2',
      '/archive/category/工程实践',
      '/archive/category/工程实践/page/2',
      '/archive/category/工程实践/前端',
      '/archive/category/工程实践/git',
      '/archive/tag/git',
      '/archive/tag/git/page/2',
      '/archives',
      '/archives/2026',
    ]);
    assert.equal(
      getBlogListRouteEntries(posts, config).find((entry) => entry.route === '/archives')?.kind,
      'archive'
    );
    assert.equal(
      getBlogListRouteEntries(posts, config).find((entry) => entry.route === '/archive/tag/git')
        ?.kind,
      'filter'
    );
  });
});
