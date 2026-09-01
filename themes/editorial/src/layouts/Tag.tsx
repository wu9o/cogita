import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allTags, getRelatedTags, tagsConfig } from 'virtual-tags-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { getBase, getPageRoute } from '../utils';

/** 标签索引和标签详情页面。 */
const TagLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  const tagPrefix = tagsConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const slug = route.startsWith(`${tagPrefix}/`) ? route.slice(`${tagPrefix}/`.length) : '';

  if (!slug) {
    return (
      <div className="editorial-index-page">
        <header className="editorial-page-header">
          <p className="editorial-eyebrow">Topics</p>
          <h1>{t('editorial.tag.title', 'Article topics')}</h1>
          <p>{t('editorial.tag.total', `${allTags.length} topics`, { count: allTags.length })}</p>
        </header>
        <div className="editorial-all-topics">
          {allTags.map((tag) => (
            <a key={tag.slug} href={normalizeHrefInRuntime(`${base}${tag.route}`)}>
              <strong>{tag.name}</strong>
              <span>{tag.count}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  const tag = allTags.find((item) => item.slug === slug);
  if (!tag) {
    return (
      <div className="editorial-index-page">
        <a href={normalizeHrefInRuntime(`${base}/${tagsConfig.routePrefix}`)}>
          ← {t('editorial.tag.back', 'Back to topics')}
        </a>
        <p className="editorial-empty">{t('editorial.tag.notFound', 'Topic not found.')}</p>
      </div>
    );
  }

  const relatedTags = getRelatedTags(tag.name, 8);
  const posts = tag.posts.map((post) => ({ ...post, url: post.route, filePath: '' }));

  return (
    <div className="editorial-index-page">
      <header className="editorial-page-header">
        <p className="editorial-eyebrow">Topic</p>
        <h1>#{tag.name}</h1>
        <p>{t('editorial.tag.count', `${tag.count} posts`, { count: tag.count })}</p>
        <a href={normalizeHrefInRuntime(`${base}/${tagsConfig.routePrefix}`)}>
          {t('editorial.tag.index', 'Back to topic index')}
        </a>
      </header>
      <PostCardList posts={posts} />
      {relatedTags.length > 0 && (
        <section className="editorial-related-topics">
          <p className="editorial-eyebrow">Related topics</p>
          <div className="editorial-topic-list">
            {relatedTags.map((related) => (
              <a key={related.slug} href={normalizeHrefInRuntime(`${base}${related.route}`)}>
                {related.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TagLayout;
