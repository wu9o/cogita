import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allBlogListFilters, blogListConfig, getBlogListPage } from 'virtual-blog-list-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { addPostCovers, getBase, getPageRoute } from '../utils';

function getPageNumber(route: string): number {
  const match = route.replace(/^\/+/, '').match(/\/page\/(\d+)$/);
  return match ? Number(match[1]) : 1;
}

function getFilterKey(route: string): string {
  const filter = allBlogListFilters.find(
    (item) => route === item.route || route.startsWith(`${item.route}/page/`)
  );
  return filter?.key || 'all';
}

/** 全部文章分页页面，使用 Editorial 主题统一的文章列表。 */
const BlogListLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base);
  const pageNumber = getPageNumber(route);
  const filterKey = getFilterKey(route);
  const page = getBlogListPage(pageNumber, filterKey) || getBlogListPage(1, 'all');

  if (!page)
    return <p className="editorial-empty">{t('editorial.blogList.empty', 'No posts yet.')}</p>;

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Archive</p>
        <h1>
          {page.filter
            ? `${page.filter.kind === 'tag' ? t('editorial.blogList.topic', 'Topic') : t('editorial.blogList.category', 'Category')}: ${page.filter.label}`
            : t('editorial.blogList.allPosts', 'All posts')}
        </h1>
        <p>
          {page.filter ? `${page.filter.count} ${t('editorial.blogList.posts', 'posts')} · ` : ''}
          {t('editorial.blogList.page', `Page ${page.page} of ${page.totalPages}`, {
            page: page.page,
            total: page.totalPages,
          })}
        </p>
        <a href={normalizeHrefInRuntime(`${base}/`)}>
          {t('editorial.blogList.home', 'Back to home')}
        </a>
      </header>

      <nav
        className="editorial-filter-nav"
        aria-label={t('editorial.blogList.filters', 'Post filters')}
      >
        <a
          href={normalizeHrefInRuntime(`${base}/${blogListConfig.routePrefix}`)}
          className={!page.filter ? 'is-active' : undefined}
        >
          {t('editorial.blogList.all', 'All')}
        </a>
        {allBlogListFilters.map((filter) => (
          <a
            key={filter.key}
            href={normalizeHrefInRuntime(`${base}${filter.route}`)}
            className={page.filter?.key === filter.key ? 'is-active' : undefined}
          >
            {filter.kind === 'tag' ? '#' : ''}
            {filter.label} ({filter.count})
          </a>
        ))}
      </nav>

      {page.posts.length > 0 ? (
        <PostCardList posts={addPostCovers(page.posts)} />
      ) : (
        <p className="editorial-empty">{t('editorial.blogList.empty', 'No posts yet.')}</p>
      )}

      {page.totalPages > 1 && (
        <nav
          className="editorial-pagination"
          aria-label={t('editorial.blogList.pagination', 'Post pagination')}
        >
          {page.previous ? (
            <a href={normalizeHrefInRuntime(`${base}${page.previous}`)}>
              ← {t('editorial.blogList.previous', 'Previous')}
            </a>
          ) : (
            <span />
          )}
          <span>
            {page.page} / {page.totalPages}
          </span>
          {page.next ? (
            <a href={normalizeHrefInRuntime(`${base}${page.next}`)}>
              {t('editorial.blogList.next', 'Next')} →
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
};

export default BlogListLayout;
