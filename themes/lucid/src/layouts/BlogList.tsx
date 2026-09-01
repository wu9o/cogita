import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import {
  allBlogListFilters,
  type allBlogListPages,
  blogListConfig,
  getBlogListPage,
} from 'virtual-blog-list-data';
import { postCovers } from 'virtual-images-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { getBase, getPageRoute } from '../utils';

function getPageNumber(route: string): number {
  const match = route.replace(/^\/+/, '').match(/\/page\/(\d+)$/);
  const page = match ? Number(match[1]) : 1;
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getFilterKey(route: string): string {
  const filter = allBlogListFilters.find(
    (item) => route === item.route || route.startsWith(`${item.route}/page/`)
  );
  return filter?.key || 'all';
}

function addPostCovers(posts: (typeof allBlogListPages)[number]['posts']) {
  return posts.map((post) => {
    const cover = postCovers[post.route];
    return cover
      ? {
          ...post,
          image: cover.src,
          imageAlt: cover.alt,
          imageCaption: cover.caption,
          imageWidth: cover.width,
          imageHeight: cover.height,
        }
      : post;
  });
}

/** 文章列表布局，负责选择构建期生成的分页数据。 */
const BlogListLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base);
  const pageNumber = getPageNumber(route);
  const filterKey = getFilterKey(route);
  const page = getBlogListPage(pageNumber, filterKey) || getBlogListPage(1, 'all');

  if (!page) {
    return <p className="blog-list-empty">{t('lucid.blogList.empty', 'No posts yet.')}</p>;
  }

  return (
    <div className="blog-list-page">
      <header className="blog-list-header">
        <div>
          <p className="blog-list-eyebrow">{t('lucid.blogList.eyebrow', 'Archive')}</p>
          <h1 className="blog-list-title">
            {page.filter
              ? `${page.filter.kind === 'tag' ? t('lucid.blogList.topic', 'Topic') : t('lucid.blogList.category', 'Category')}: ${page.filter.label}`
              : t('lucid.blogList.allPosts', 'All posts')}
          </h1>
          <p className="blog-list-meta">
            {page.filter ? `${page.filter.count} ${t('lucid.blogList.posts', 'posts')} · ` : ''}
            {t('lucid.blogList.page', `Page ${page.page} of ${page.totalPages}`, {
              page: page.page,
              total: page.totalPages,
            })}
          </p>
        </div>
        <a href={normalizeHrefInRuntime(`${base}/`)}>{t('lucid.blogList.home', 'Back to home')}</a>
      </header>

      <nav
        className="blog-list-filter-nav"
        aria-label={t('lucid.blogList.filters', 'Post filters')}
      >
        <a
          href={normalizeHrefInRuntime(`${base}/${blogListConfig.routePrefix}`)}
          className={!page.filter ? 'blog-list-filter-active' : undefined}
        >
          {t('lucid.blogList.all', 'All')}
        </a>
        {allBlogListFilters.map((filter) => (
          <a
            key={filter.key}
            href={normalizeHrefInRuntime(`${base}${filter.route}`)}
            className={page.filter?.key === filter.key ? 'blog-list-filter-active' : undefined}
          >
            {filter.kind === 'tag' ? '#' : ''}
            {filter.label} ({filter.count})
          </a>
        ))}
      </nav>

      {page.posts.length > 0 ? (
        <PostCardList posts={addPostCovers(page.posts)} />
      ) : (
        <p className="blog-list-empty">{t('lucid.blogList.empty', 'No posts yet.')}</p>
      )}

      {page.totalPages > 1 && (
        <nav
          className="blog-pagination"
          aria-label={t('lucid.blogList.pagination', 'Post pagination')}
        >
          {page.previous ? (
            <a href={normalizeHrefInRuntime(`${base}${page.previous}`)}>
              ← {t('lucid.blogList.previous', 'Previous')}
            </a>
          ) : (
            <span className="blog-pagination-disabled">
              ← {t('lucid.blogList.previous', 'Previous')}
            </span>
          )}
          <span>
            {page.page} / {page.totalPages}
          </span>
          {page.next ? (
            <a href={normalizeHrefInRuntime(`${base}${page.next}`)}>
              {t('lucid.blogList.next', 'Next')} →
            </a>
          ) : (
            <span className="blog-pagination-disabled">{t('lucid.blogList.next', 'Next')} →</span>
          )}
        </nav>
      )}
    </div>
  );
};

export default BlogListLayout;
