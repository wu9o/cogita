import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allBlogListPages, blogListConfig } from 'virtual-blog-list-data';
import { postCovers } from 'virtual-images-data';
import { getBase, getCurrentRoute } from '../utils';

function getPageNumber(pathname: string, base: string): number {
  const route = getCurrentRoute(pathname, base).replace(/^\/+/, '');
  const match = route.match(new RegExp(`^${blogListConfig.routePrefix}/page/(\\d+)$`));
  const page = match ? Number(match[1]) : 1;
  return Number.isInteger(page) && page > 0 ? page : 1;
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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const pageNumber = getPageNumber(pathname, base);
  const page = allBlogListPages.find((item) => item.page === pageNumber) || allBlogListPages[0];

  if (!page) {
    return <p className="blog-list-empty">暂无文章</p>;
  }

  return (
    <div className="blog-list-page">
      <header className="blog-list-header">
        <div>
          <p className="blog-list-eyebrow">文章归档</p>
          <h1 className="blog-list-title">全部文章</h1>
          <p className="blog-list-meta">
            第 {page.page} / {page.totalPages} 页
          </p>
        </div>
        <a href={normalizeHrefInRuntime(`${base}/`)}>返回首页</a>
      </header>

      {page.posts.length > 0 ? (
        <PostList posts={addPostCovers(page.posts)} showTags showCover />
      ) : (
        <p className="blog-list-empty">暂无文章</p>
      )}

      {page.totalPages > 1 && (
        <nav className="blog-pagination" aria-label="文章列表分页">
          {page.previous ? (
            <a href={normalizeHrefInRuntime(`${base}${page.previous}`)}>← 上一页</a>
          ) : (
            <span className="blog-pagination-disabled">← 上一页</span>
          )}
          <span>
            {page.page} / {page.totalPages}
          </span>
          {page.next ? (
            <a href={normalizeHrefInRuntime(`${base}${page.next}`)}>下一页 →</a>
          ) : (
            <span className="blog-pagination-disabled">下一页 →</span>
          )}
        </nav>
      )}
    </div>
  );
};

export default BlogListLayout;
