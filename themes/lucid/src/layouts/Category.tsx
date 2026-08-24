import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
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
import { getBase, getCurrentRoute } from '../utils';

function getCategorySlug(pathname: string, base: string): string {
  const route = getCurrentRoute(pathname, base).replace(/^\/+/, '');
  const categoryPrefix = categoriesConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  return route.startsWith(`${categoryPrefix}/`) ? route.slice(`${categoryPrefix}/`.length) : '';
}

function toPostListPosts(posts: (typeof allCategories)[number]['posts']) {
  return posts.map((post) => ({ ...post, filePath: '', url: post.route }));
}

/** 分类页面布局，统一处理分类索引、详情、子分类和面包屑。 */
const CategoryLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const slug = getCategorySlug(pathname, base);
  const categoriesHref = normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`);

  if (!slug) {
    return (
      <div className="category-page">
        <header className="category-header">
          <p className="blog-list-eyebrow">内容组织</p>
          <h1 className="blog-list-title">文章分类</h1>
          <p className="blog-list-meta">共 {allCategories.length} 个分类</p>
        </header>

        {allCategories.length === 0 ? (
          <p className="category-empty">暂无分类</p>
        ) : (
          <nav className="category-tree" aria-label="文章分类列表">
            {allCategories.map((category) => (
              <a
                key={category.path}
                href={normalizeHrefInRuntime(`${base}${category.route}`)}
                className="category-tree-item"
                style={{ paddingLeft: `${1 + category.depth * 1.25}rem` }}
              >
                <span>{category.title}</span>
                <span className="category-count">{category.count} 篇</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    );
  }

  const category = getCategoryBySlug(slug);
  if (!category) {
    return (
      <div className="category-page">
        <a href={categoriesHref} className="category-back">
          ← 返回分类
        </a>
        <p className="category-empty">分类不存在</p>
      </div>
    );
  }

  const breadcrumbs = getCategoryBreadcrumbs(category.path);
  const children = category.children
    .map((path) => categoryMap[path])
    .filter((child): child is (typeof allCategories)[number] => Boolean(child));

  return (
    <div className="category-page">
      <header className="category-header">
        <nav className="category-breadcrumbs" aria-label="分类面包屑">
          <a href={categoriesHref}>全部分类</a>
          {breadcrumbs.map((breadcrumb) => (
            <Fragment key={breadcrumb.path}>
              <span aria-hidden="true">/</span>
              <a href={normalizeHrefInRuntime(`${base}${breadcrumb.route}`)}>{breadcrumb.title}</a>
            </Fragment>
          ))}
        </nav>
        <h1 className="blog-list-title">{category.title}</h1>
        {category.description && <p className="category-description">{category.description}</p>}
        <p className="blog-list-meta">共 {category.count} 篇文章</p>
      </header>

      {children.length > 0 && (
        <section className="category-children" aria-labelledby="category-children-title">
          <h2 id="category-children-title">子分类</h2>
          <div className="category-child-list">
            {children.map((child) => (
              <a
                key={child.path}
                href={normalizeHrefInRuntime(`${base}${child.route}`)}
                className="category-child-card"
              >
                <span>{child.title}</span>
                <span className="category-count">{child.count} 篇文章</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="category-posts" aria-labelledby="category-posts-title">
        <h2 id="category-posts-title">文章</h2>
        <PostList posts={toPostListPosts(category.posts)} showTags showCover />
      </section>
    </div>
  );
};

export default CategoryLayout;
