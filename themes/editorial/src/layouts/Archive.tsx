import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allArchives, blogListConfig, getArchive } from 'virtual-blog-list-data';
import { PostCardList } from '../components/PostCard';
import { addPostCovers, getBase } from '../utils';

function getArchiveKey(pathname: string, base: string): string {
  const route = decodeURIComponent(
    pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  )
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.html$/, '');
  return route.startsWith(`${blogListConfig.archivePrefix}/`)
    ? route.slice(`${blogListConfig.archivePrefix}/`.length)
    : '';
}

/** 时间归档页面，保留年份入口并使用统一文章卡片。 */
const ArchiveLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const key = getArchiveKey(typeof window === 'undefined' ? '' : window.location.pathname, base);
  const archive = getArchive(key);
  const total = allArchives.reduce((count, item) => count + item.count, 0);

  if (!key) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Archive</p>
          <h1>时间归档</h1>
          <p>共 {total} 篇文章</p>
        </header>
        <div className="editorial-archive-years">
          {allArchives.map((item) => (
            <a key={item.key} href={normalizeHrefInRuntime(`${base}${item.route}`)}>
              <strong>{item.label}</strong>
              <span>{item.count} 篇</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (!archive) {
    return (
      <div className="editorial-index-page">
        <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.archivePrefix}`)}>← 返回归档</a>
        <p className="editorial-empty">归档不存在。</p>
      </div>
    );
  }

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Archive</p>
        <h1>{archive.label}</h1>
        <p>共 {archive.count} 篇文章</p>
        <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.archivePrefix}`)}>返回归档</a>
      </header>
      <nav className="editorial-archive-years" aria-label="其他归档">
        {allArchives.map((item) => (
          <a
            key={item.key}
            href={normalizeHrefInRuntime(`${base}${item.route}`)}
            className={item.key === archive.key ? 'is-active' : undefined}
          >
            <strong>{item.label}</strong>
            <span>{item.count} 篇</span>
          </a>
        ))}
      </nav>
      <PostCardList posts={addPostCovers(archive.posts)} />
    </div>
  );
};

export default ArchiveLayout;
