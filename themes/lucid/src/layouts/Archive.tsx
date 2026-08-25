import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allArchives, blogListConfig, getArchive } from 'virtual-blog-list-data';
import { postCovers } from 'virtual-images-data';
import { PostCardList } from '../components/PostCard';
import { getBase, getPageRoute } from '../utils';

function getArchiveKey(pageData: Parameters<typeof getPageRoute>[0], base: string): string {
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  return route.startsWith(`${blogListConfig.archivePrefix}/`)
    ? route.slice(`${blogListConfig.archivePrefix}/`.length)
    : '';
}

function addPostCovers(posts: (typeof allArchives)[number]['posts']) {
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

/** 时间归档布局，展示对应年份或月份的文章。 */
const ArchiveLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const key = getArchiveKey(pageData, base);
  const archive = getArchive(key);
  const archiveIndex = `${base}/${blogListConfig.archivePrefix}`;

  if (!key) {
    return (
      <div className="archive-page">
        <header className="archive-header">
          <div>
            <p className="blog-list-eyebrow">文章归档</p>
            <h1 className="blog-list-title">时间归档</h1>
            <p className="blog-list-meta">
              共 {allArchives.reduce((total, item) => total + item.count, 0)} 篇文章
            </p>
          </div>
        </header>

        <div className="archive-index" aria-label="文章归档列表">
          {allArchives.map((item) => (
            <a key={item.key} href={normalizeHrefInRuntime(`${base}${item.route}`)}>
              {item.label} ({item.count})
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (!archive) {
    return (
      <div className="archive-page">
        <a href={normalizeHrefInRuntime(archiveIndex)}>← 返回归档</a>
        <p className="blog-list-empty">归档不存在</p>
      </div>
    );
  }

  return (
    <div className="archive-page">
      <header className="archive-header">
        <div>
          <a href={normalizeHrefInRuntime(archiveIndex)}>← 返回归档</a>
          <p className="blog-list-eyebrow">时间归档</p>
          <h1 className="blog-list-title">{archive.label}</h1>
          <p className="blog-list-meta">共 {archive.count} 篇文章</p>
        </div>
      </header>

      <div className="archive-index" aria-label="其他归档">
        {allArchives.map((item) => (
          <a
            key={item.key}
            href={normalizeHrefInRuntime(`${base}${item.route}`)}
            className={item.key === archive.key ? 'archive-index-active' : undefined}
          >
            {item.label} ({item.count})
          </a>
        ))}
      </div>

      <PostCardList posts={addPostCovers(archive.posts)} />
    </div>
  );
};

export default ArchiveLayout;
