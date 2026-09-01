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

/** 分类索引和层级分类详情页面。 */
const CategoryLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  const categoryPrefix = categoriesConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const slug = route.startsWith(`${categoryPrefix}/`)
    ? route.slice(`${categoryPrefix}/`.length)
    : '';
  const categoriesHref = normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`);

  if (!slug) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Categories</p>
          <h1>{t('editorial.category.title', 'Article categories')}</h1>
          <p>
            {t('editorial.category.total', `${allCategories.length} categories`, {
              count: allCategories.length,
            })}
          </p>
        </header>
        <nav
          className="editorial-category-tree"
          aria-label={t('editorial.category.list', 'Article category list')}
        >
          {allCategories.map((category) => (
            <a
              key={category.path}
              href={normalizeHrefInRuntime(`${base}${category.route}`)}
              style={{ paddingLeft: `${1 + category.depth * 1.25}rem` }}
            >
              <span>{category.title}</span>
              <small>
                {t('editorial.category.count', `${category.count} posts`, {
                  count: category.count,
                })}
              </small>
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
        <a href={categoriesHref}>← {t('editorial.category.back', 'Back to categories')}</a>
        <p className="editorial-empty">{t('editorial.category.notFound', 'Category not found.')}</p>
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
        <nav
          className="editorial-breadcrumbs"
          aria-label={t('editorial.category.breadcrumbs', 'Category breadcrumbs')}
        >
          <a href={categoriesHref}>{t('editorial.category.all', 'All categories')}</a>
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
        <a href={categoriesHref}>{t('editorial.category.index', 'Back to category index')}</a>
      </header>

      {children.length > 0 && (
        <section className="editorial-child-categories">
          {children.map((child) => (
            <a key={child.path} href={normalizeHrefInRuntime(`${base}${child.route}`)}>
              <strong>{child.title}</strong>
              <span>
                {t('editorial.category.count', `${child.count} posts`, { count: child.count })}
              </span>
            </a>
          ))}
        </section>
      )}

      <PostCardList posts={posts} />
    </div>
  );
};

export default CategoryLayout;
