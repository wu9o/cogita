import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildArchives,
  buildFilters,
  filterPosts,
  paginatePosts,
  resolveBlogListConfig,
  sortPosts,
} from '../dist/utils.js';

function createPost(title, createDate, updateDate = createDate, metadata = {}) {
  return {
    title,
    description: `${title} description`,
    filePath: `${title}.md`,
    route: `/posts/${title}`,
    createDate,
    updateDate,
    url: `/posts/${title}`,
    ...metadata,
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

  it('应生成标签和层级分类筛选项并统计文章数', () => {
    const posts = [
      createPost('git', '2026-01-01', '2026-01-01', {
        tags: ['Git', '技巧'],
        categories: ['工程实践/Git'],
      }),
      createPost('frontend', '2025-01-01', '2025-01-01', {
        tags: ['git'],
        categories: ['工程实践/前端'],
      }),
    ];
    const filters = buildFilters(posts, resolveBlogListConfig({ routePrefix: 'archive' }));

    assert.deepEqual(
      filters.find((filter) => filter.key === 'tag:git'),
      {
        key: 'tag:git',
        kind: 'tag',
        value: 'Git',
        label: 'Git',
        slug: 'git',
        count: 2,
        route: '/archive/tag/git',
      }
    );
    assert.equal(filters.find((filter) => filter.value === '工程实践')?.count, 2);
    assert.equal(
      filters.find((filter) => filter.value === '工程实践/Git')?.route,
      '/archive/category/工程实践/git'
    );
  });

  it('应按标签和分类筛选文章，父分类包含子分类文章', () => {
    const posts = [
      createPost('git', '2026-01-01', '2026-01-01', {
        tags: ['Git'],
        categories: ['工程实践/Git'],
      }),
      createPost('frontend', '2025-01-01', '2025-01-01', {
        tags: ['前端'],
        categories: ['工程实践/前端'],
      }),
    ];
    const config = resolveBlogListConfig();
    const filters = buildFilters(posts, config);
    const tagFilter = filters.find((filter) => filter.key === 'tag:git');
    const categoryFilter = filters.find((filter) => filter.value === '工程实践');

    assert.ok(tagFilter);
    assert.ok(categoryFilter);
    assert.deepEqual(
      filterPosts(posts, tagFilter).map((post) => post.title),
      ['git']
    );
    assert.deepEqual(
      filterPosts(posts, categoryFilter).map((post) => post.title),
      ['git', 'frontend']
    );
  });

  it('应为筛选列表生成独立分页路由', () => {
    const posts = [createPost('one', '2026-01-01'), createPost('two', '2025-01-01')];
    const [filter] = buildFilters(
      posts.map((post) => ({ ...post, tags: ['Git'] })),
      resolveBlogListConfig()
    );
    const pages = paginatePosts(posts, resolveBlogListConfig({ pageSize: 1 }), filter);

    assert.equal(pages.length, 2);
    assert.equal(pages[0].route, '/archive/tag/git');
    assert.equal(pages[0].next, '/archive/tag/git/page/2');
    assert.equal(pages[1].previous, '/archive/tag/git');
    assert.equal(pages[1].filter?.key, 'tag:git');
  });
});
