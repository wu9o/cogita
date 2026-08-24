import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { createContentIndex } from '../dist/es/index.js';

describe('构建期内容索引', () => {
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
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
