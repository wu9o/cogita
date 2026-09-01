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
import { t } from '../i18n';
import { getBase, getPageRoute } from '../utils';

function getCategorySlug(pageData: Parameters<typeof getPageRoute>[0], base: string): string {
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
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
  const slug = getCategorySlug(pageData, base);
  const categoriesHref = normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`);

  if (!slug) {
    return (
      <div className="category-page">
        <header className="category-header">
          <p className="blog-list-eyebrow">{t('lucid.category.eyebrow', 'Content organization')}</p>
          <h1 className="blog-list-title">{t('lucid.category.title', 'Article categories')}</h1>
          <p className="blog-list-meta">
            {t('lucid.category.total', `${allCategories.length} categories`, {
              count: allCategories.length,
            })}
          </p>
        </header>

        {allCategories.length === 0 ? (
          <p className="category-empty">{t('lucid.category.empty', 'No categories yet.')}</p>
        ) : (
          <nav
            className="category-tree"
            aria-label={t('lucid.category.list', 'Article category list')}
          >
            {allCategories.map((category) => (
              <a
                key={category.path}
                href={normalizeHrefInRuntime(`${base}${category.route}`)}
                className="category-tree-item"
                style={{ paddingLeft: `${1 + category.depth * 1.25}rem` }}
              >
                <span>{category.title}</span>
                <span className="category-count">
                  {t('lucid.category.count', `${category.count} posts`, { count: category.count })}
                </span>
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
          ← {t('lucid.category.back', 'Back to categories')}
        </a>
        <p className="category-empty">{t('lucid.category.notFound', 'Category not found.')}</p>
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
        <nav
          className="category-breadcrumbs"
          aria-label={t('lucid.category.breadcrumbs', 'Category breadcrumbs')}
        >
          <a href={categoriesHref}>{t('lucid.category.all', 'All categories')}</a>
          {breadcrumbs.map((breadcrumb) => (
            <Fragment key={breadcrumb.path}>
              <span aria-hidden="true">/</span>
              <a href={normalizeHrefInRuntime(`${base}${breadcrumb.route}`)}>{breadcrumb.title}</a>
            </Fragment>
          ))}
        </nav>
        <h1 className="blog-list-title">{category.title}</h1>
        {category.description && <p className="category-description">{category.description}</p>}
        <p className="blog-list-meta">
          {t('lucid.category.count', `${category.count} posts`, { count: category.count })}
        </p>
      </header>

      {children.length > 0 && (
        <section className="category-children" aria-labelledby="category-children-title">
          <h2 id="category-children-title">{t('lucid.category.children', 'Subcategories')}</h2>
          <div className="category-child-list">
            {children.map((child) => (
              <a
                key={child.path}
                href={normalizeHrefInRuntime(`${base}${child.route}`)}
                className="category-child-card"
              >
                <span>{child.title}</span>
                <span className="category-count">
                  {t('lucid.category.count', `${child.count} posts`, { count: child.count })}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="category-posts" aria-labelledby="category-posts-title">
        <h2 id="category-posts-title">{t('lucid.category.posts', 'Posts')}</h2>
        <PostCardList posts={toPostListPosts(category.posts)} />
      </section>
    </div>
  );
};

export default CategoryLayout;
