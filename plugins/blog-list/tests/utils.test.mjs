import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildArchives, paginatePosts, resolveBlogListConfig, sortPosts } from '../dist/utils.js';

function createPost(title, createDate, updateDate = createDate) {
  return {
    title,
    description: `${title} description`,
    filePath: `${title}.md`,
    route: `/posts/${title}`,
    createDate,
    updateDate,
    url: `/posts/${title}`,
  };
}

describe('文章列表工具函数', () => {
  it('应规范化配置并限制最小分页数量', () => {
    const config = resolveBlogListConfig({
      routePrefix: '/archive/',
      archivePrefix: '/archives/',
      pageSize: 0.8,
    });

    assert.equal(config.routePrefix, 'archive');
    assert.equal(config.archivePrefix, 'archives');
    assert.equal(config.pageSize, 1);
  });

  it('应按日期倒序排列，并在日期相同时保持输入顺序', () => {
    const posts = [
      createPost('first', '2025-01-01'),
      createPost('second', '2026-01-01'),
      createPost('third', '2025-01-01'),
    ];
    const config = resolveBlogListConfig({ sortBy: 'createDate', order: 'desc' });

    assert.deepEqual(
      sortPosts(posts, config).map((post) => post.title),
      ['second', 'first', 'third']
    );
  });

  it('应生成正确的分页路由和前后页链接', () => {
    const posts = [
      createPost('one', '2026-01-01'),
      createPost('two', '2025-01-01'),
      createPost('three', '2024-01-01'),
    ];
    const pages = paginatePosts(posts, resolveBlogListConfig({ pageSize: 2 }));

    assert.equal(pages.length, 2);
    assert.equal(pages[0].page, 1);
    assert.equal(pages[0].totalPages, 2);
    assert.deepEqual(pages[0].posts, posts.slice(0, 2));
    assert.equal(pages[0].route, '/archive');
    assert.equal(pages[0].next, '/archive/page/2');
    assert.equal(pages[1].previous, '/archive');
    assert.equal(pages[1].route, '/archive/page/2');
  });

  it('应生成年度归档并统计非法日期', () => {
    const posts = [
      createPost('new', '2026-02-01'),
      createPost('old', '2025-08-01'),
      createPost('invalid', 'unknown'),
    ];
    const result = buildArchives(posts, resolveBlogListConfig({ archiveGranularity: 'year' }));

    assert.equal(result.invalidDateCount, 1);
    assert.deepEqual(
      result.archives.map((archive) => [archive.key, archive.count, archive.route]),
      [
        ['2026', 1, '/archives/2026'],
        ['2025', 1, '/archives/2025'],
      ]
    );
  });

  it('应按月生成归档分组', () => {
    const posts = [createPost('january', '2026-01-01'), createPost('february', '2026-02-01')];
    const result = buildArchives(posts, resolveBlogListConfig({ archiveGranularity: 'month' }));

    assert.deepEqual(
      result.archives.map((archive) => archive.key),
      ['2026-02', '2026-01']
    );
  });
});
