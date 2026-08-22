import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateCategoryStats,
  processCategoriesFromPosts,
  resolveCategoriesConfig,
} from '../dist/utils.js';

function createPost(route, categories, date = '2026-01-01') {
  return {
    title: route,
    route,
    url: route,
    filePath: `${route}.md`,
    createDate: date,
    updateDate: date,
    categories,
  };
}

describe('分类工具函数', () => {
  it('应规范化默认配置并保留层级分隔符', () => {
    const config = resolveCategoriesConfig({ routePrefix: '/category/', separator: ' / ' });

    assert.equal(config.routePrefix, 'category');
    assert.equal(config.separator, '/');
    assert.equal(config.minPostCount, 1);
    assert.equal(config.sortBy, 'name');
  });

  it('应自动生成父分类，并且父分类聚合子分类文章', () => {
    const config = resolveCategoriesConfig({});
    const { categoriesData, categoriesMap } = processCategoriesFromPosts(
      [createPost('/posts/react', ['前端/React']), createPost('/posts/vue', ['前端/Vue'])],
      config
    );

    assert.equal(categoriesData.length, 3);
    assert.equal(categoriesMap.get('前端')?.count, 2);
    assert.deepEqual(categoriesMap.get('前端')?.children, ['前端/React', '前端/Vue']);
    assert.equal(categoriesMap.get('前端/React')?.route, '/categories/前端/react');
  });

  it('应去重同一文章重复声明的分类，并支持排除子树', () => {
    const config = resolveCategoriesConfig({ excludeCategories: ['内部'] });
    const { categoriesMap } = processCategoriesFromPosts(
      [createPost('/posts/demo', ['公开', '公开', '内部/实验'])],
      config
    );

    assert.equal(categoriesMap.get('公开')?.count, 1);
    assert.equal(categoriesMap.has('内部'), false);
    assert.equal(categoriesMap.has('内部/实验'), false);
  });

  it('应计算根分类数量和平均文章数', () => {
    const config = resolveCategoriesConfig({});
    const { categoriesData } = processCategoriesFromPosts(
      [createPost('/posts/react', ['前端/React']), createPost('/posts/ops', ['运维'])],
      config
    );
    const stats = calculateCategoryStats(categoriesData);

    assert.equal(stats.totalCategories, 3);
    assert.equal(stats.rootCategories, 2);
    assert.equal(stats.averagePostsPerCategory, 1);
  });
});
