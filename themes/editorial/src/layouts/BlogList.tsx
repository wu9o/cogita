import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allBlogListPages, blogListConfig } from 'virtual-blog-list-data';
import { PostCardList } from '../components/PostCard';
import { addPostCovers, getBase, getCurrentRoute } from '../utils';

function getPageNumber(pathname: string, base: string): number {
  const route = getCurrentRoute(base, pathname).replace(/^\/+/, '');
  const match = route.match(new RegExp(`^${blogListConfig.routePrefix}/page/(\\d+)$`));
  return match ? Number(match[1]) : 1;
}

/** 全部文章分页页面，使用 Editorial 主题统一的文章列表。 */
const BlogListLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const pageNumber = getPageNumber(
    typeof window === 'undefined' ? '' : window.location.pathname,
    base
  );
  const page = allBlogListPages.find((item) => item.page === pageNumber) || allBlogListPages[0];

  if (!page) return <p className="editorial-empty">暂无文章。</p>;

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Archive</p>
        <h1>全部文章</h1>
        <p>
          第 {page.page} / {page.totalPages} 页
        </p>
        <a href={normalizeHrefInRuntime(`${base}/`)}>返回首页</a>
      </header>

      {page.posts.length > 0 ? (
        <PostCardList posts={addPostCovers(page.posts)} />
      ) : (
        <p className="editorial-empty">暂无文章。</p>
      )}

      {page.totalPages > 1 && (
        <nav className="editorial-pagination" aria-label="文章列表分页">
          {page.previous ? (
            <a href={normalizeHrefInRuntime(`${base}${page.previous}`)}>← 上一页</a>
          ) : (
            <span />
          )}
          <span>
            {page.page} / {page.totalPages}
          </span>
          {page.next ? (
            <a href={normalizeHrefInRuntime(`${base}${page.next}`)}>下一页 →</a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
};

export default BlogListLayout;
