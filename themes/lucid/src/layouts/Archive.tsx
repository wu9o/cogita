import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allArchives, blogListConfig, getArchive } from 'virtual-blog-list-data';
import { postCovers } from 'virtual-images-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
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
            <p className="blog-list-eyebrow">{t('lucid.archive.eyebrow', 'Archive')}</p>
            <h1 className="blog-list-title">{t('lucid.archive.title', 'Post archive')}</h1>
            <p className="blog-list-meta">
              {t(
                'lucid.archive.total',
                `${allArchives.reduce((total, item) => total + item.count, 0)} posts`,
                { count: allArchives.reduce((total, item) => total + item.count, 0) }
              )}
            </p>
          </div>
        </header>

        <div className="archive-index" aria-label={t('lucid.archive.list', 'Post archive list')}>
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
        <a href={normalizeHrefInRuntime(archiveIndex)}>
          ← {t('lucid.archive.back', 'Back to archive')}
        </a>
        <p className="blog-list-empty">{t('lucid.archive.notFound', 'Archive not found.')}</p>
      </div>
    );
  }

  return (
    <div className="archive-page">
      <header className="archive-header">
        <div>
          <a href={normalizeHrefInRuntime(archiveIndex)}>
            ← {t('lucid.archive.back', 'Back to archive')}
          </a>
          <p className="blog-list-eyebrow">{t('lucid.archive.eyebrow', 'Archive')}</p>
          <h1 className="blog-list-title">{archive.label}</h1>
          <p className="blog-list-meta">
            {t('lucid.archive.total', `${archive.count} posts`, { count: archive.count })}
          </p>
        </div>
      </header>

      <div className="archive-index" aria-label={t('lucid.archive.other', 'Other archives')}>
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
