import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allArchives, blogListConfig, getArchive } from 'virtual-blog-list-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { addPostCovers, getBase, getPageRoute } from '../utils';

function getArchiveKey(route: string): string {
  const normalizedRoute = route.replace(/^\/+/, '');
  return normalizedRoute.startsWith(`${blogListConfig.archivePrefix}/`)
    ? normalizedRoute.slice(`${blogListConfig.archivePrefix}/`.length)
    : '';
}

/** 时间归档页面，保留年份入口并使用统一文章卡片。 */
const ArchiveLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const key = getArchiveKey(getPageRoute(pageData, base));
  const archive = getArchive(key);
  const total = allArchives.reduce((count, item) => count + item.count, 0);

  if (!key) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Archive</p>
          <h1>{t('editorial.archive.title', 'Post archive')}</h1>
          <p>{t('editorial.archive.total', `${total} posts`, { count: total })}</p>
        </header>
        <div className="editorial-archive-years">
          {allArchives.map((item) => (
            <a key={item.key} href={normalizeHrefInRuntime(`${base}${item.route}`)}>
              <strong>{item.label}</strong>
              <span>
                {t('editorial.archive.count', `${item.count} posts`, { count: item.count })}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (!archive) {
    return (
      <div className="editorial-index-page">
        <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.archivePrefix}`)}>
          ← {t('editorial.archive.back', 'Back to archive')}
        </a>
        <p className="editorial-empty">{t('editorial.archive.notFound', 'Archive not found.')}</p>
      </div>
    );
  }

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Archive</p>
        <h1>{archive.label}</h1>
        <p>{t('editorial.archive.total', `${archive.count} posts`, { count: archive.count })}</p>
        <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.archivePrefix}`)}>
          {t('editorial.archive.back', 'Back to archive')}
        </a>
      </header>
      <nav
        className="editorial-archive-years"
        aria-label={t('editorial.archive.other', 'Other archives')}
      >
        {allArchives.map((item) => (
          <a
            key={item.key}
            href={normalizeHrefInRuntime(`${base}${item.route}`)}
            className={item.key === archive.key ? 'is-active' : undefined}
          >
            <strong>{item.label}</strong>
            <span>
              {t('editorial.archive.count', `${item.count} posts`, { count: item.count })}
            </span>
          </a>
        ))}
      </nav>
      <PostCardList posts={addPostCovers(archive.posts)} />
    </div>
  );
};

export default ArchiveLayout;
