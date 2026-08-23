import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import { Fragment } from 'react';
import type React from 'react';
import {
  allCategories,
  categoriesConfig,
  categoryMap,
  getCategoryBreadcrumbs,
  getCategoryBySlug,
} from 'virtual-categories-data';
import { PostCardList } from '../components/PostCard';
import { getBase } from '../utils';

/** 分类索引和层级分类详情页面。 */
const CategoryLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const rawSlug =
    pathname
      .split(`/${categoriesConfig.routePrefix}/`)[1]
      ?.replace(/\.html$/, '')
      .replace(/\/$/, '') || '';
  const slug = decodeURIComponent(rawSlug);
  const categoriesHref = normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`);

  if (!slug) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Categories</p>
          <h1>文章分类</h1>
          <p>共 {allCategories.length} 个分类</p>
        </header>
        <nav className="editorial-category-tree" aria-label="文章分类列表">
          {allCategories.map((category) => (
            <a
              key={category.path}
              href={normalizeHrefInRuntime(`${base}${category.route}`)}
              style={{ paddingLeft: `${1 + category.depth * 1.25}rem` }}
            >
              <span>{category.title}</span>
              <small>{category.count} 篇</small>
            </a>
          ))}
        </nav>
      </div>
    );
  }

  const category = getCategoryBySlug(slug);
  if (!category) {
    return (
      <div className="editorial-index-page">
        <a href={categoriesHref}>← 返回分类</a>
        <p className="editorial-empty">分类不存在。</p>
      </div>
    );
  }

  const children = category.children
    .map((path) => categoryMap[path])
    .filter((child): child is (typeof allCategories)[number] => Boolean(child));
  const breadcrumbs = getCategoryBreadcrumbs(category.path);
  const posts = category.posts.map((post) => ({ ...post, url: post.route, filePath: '' }));

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <nav className="editorial-breadcrumbs" aria-label="分类面包屑">
          <a href={categoriesHref}>全部分类</a>
          {breadcrumbs.map((breadcrumb) => (
            <Fragment key={breadcrumb.path}>
              <span>/</span>
              <a href={normalizeHrefInRuntime(`${base}${breadcrumb.route}`)}>{breadcrumb.title}</a>
            </Fragment>
          ))}
        </nav>
        <p className="editorial-eyebrow">Category</p>
        <h1>{category.title}</h1>
        {category.description && <p>{category.description}</p>}
        <a href={categoriesHref}>返回分类索引</a>
      </header>

      {children.length > 0 && (
        <section className="editorial-child-categories">
          {children.map((child) => (
            <a key={child.path} href={normalizeHrefInRuntime(`${base}${child.route}`)}>
              <strong>{child.title}</strong>
              <span>{child.count} 篇文章</span>
            </a>
          ))}
        </section>
      )}

      <PostCardList posts={posts} />
    </div>
  );
};

export default CategoryLayout;
