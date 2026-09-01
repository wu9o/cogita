import type { LayoutProps } from '@cogita/shared';
import type { Post } from '@cogita/ui';
import { TagCloud } from '@cogita/ui';
import { normalizeHrefInRuntime } from '@rspress/runtime';
import { usePageData } from '@rspress/runtime';
import type React from 'react';
import { blogListConfig } from 'virtual-blog-list-data';
import { allCategories, categoriesConfig } from 'virtual-categories-data';
import { allCollections } from 'virtual-collections-data';
import { postCovers } from 'virtual-images-data';
import { allPosts } from 'virtual-posts-data';
import { searchConfig } from 'virtual-search-data';
import { allTags, tagsConfig } from 'virtual-tags-data';
import { PostCard, PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { getBase, getLucidConfig, getSiteMetadata } from '../utils';

/**
 * 首页布局组件
 *
 * 首页结构：品牌 Hero、主推文章、最近更新和内容导航。
 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const site = getSiteMetadata(pageData);
  const lucidConfig = getLucidConfig(pageData);
  const postsWithCovers = allPosts.map((post) => {
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
  const configuredFeatured = lucidConfig.featuredPost;
  const featured = configuredFeatured
    ? postsWithCovers.find(
        (post) =>
          post.route === configuredFeatured ||
          post.route === `/${configuredFeatured.replace(/^\/+/, '')}`
      )
    : postsWithCovers[0];
  const recentPosts = postsWithCovers.filter((post) => post.route !== featured?.route).slice(0, 5);

  return (
    <div className="home-layout lucid-home">
      <section className="lucid-hero">
        <div className="lucid-hero-copy">
          <p className="lucid-eyebrow">{lucidConfig.heroEyebrow}</p>
          <h1>{site.description}</h1>
          <p className="lucid-hero-description">{lucidConfig.heroCopy}</p>
          <nav
            className="lucid-hero-actions"
            aria-label={t('lucid.home.navigation', 'Blog navigation')}
          >
            <a className="lucid-action-primary" href={normalizeHrefInRuntime(`${base}/archive`)}>
              {t('lucid.home.allPosts', 'Browse all posts')}
            </a>
            {searchConfig.enabled && (
              <a className="lucid-action-secondary" href={normalizeHrefInRuntime(`${base}/search`)}>
                {t('lucid.home.search', 'Search articles')}
              </a>
            )}
          </nav>
        </div>
        <div className="lucid-hero-panel" aria-label={t('lucid.home.overview', 'Site overview')}>
          <span className="lucid-hero-panel-label">{site.title}</span>
          <strong>{allPosts.length}</strong>
          <span>{t('lucid.home.postCount', 'posts and counting')}</span>
          <div className="lucid-hero-panel-line" />
          <span>
            {t('lucid.home.tagCount', `${allTags.length} topics`, { count: allTags.length })}
          </span>
        </div>
      </section>

      {featured && (
        <section className="lucid-featured" aria-labelledby="lucid-featured-title">
          <div className="lucid-section-heading">
            <div>
              <p className="lucid-eyebrow">Featured</p>
              <h2 id="lucid-featured-title">{t('lucid.home.featured', 'Featured reading')}</h2>
            </div>
          </div>
          <PostCard post={featured as Post} featured />
        </section>
      )}

      <div
        className={`home-content${lucidConfig.showSidebar ? '' : ' home-content-without-sidebar'}`}
      >
        {lucidConfig.showSidebar && (
          <aside className="home-sidebar">
            <section className="sidebar-section">
              <h2 className="sidebar-title">{t('lucid.home.topics', 'Topics')}</h2>
              <TagCloud tags={allTags} config={tagsConfig.tagCloud} className="lucid-tag-cloud" />
            </section>
            <section className="sidebar-section">
              <h2 className="sidebar-title">{t('lucid.home.categories', 'Categories')}</h2>
              {allCategories.length === 0 ? (
                <p className="sidebar-hint">{t('lucid.home.noCategories', 'No categories yet.')}</p>
              ) : (
                <>
                  <ul className="sidebar-categories">
                    {allCategories
                      .filter((category) => category.depth === 0)
                      .slice(0, 6)
                      .map((category) => (
                        <li key={category.path}>
                          <a
                            href={normalizeHrefInRuntime(`${base}${category.route}`)}
                            className="sidebar-category-link"
                          >
                            <span>{category.title}</span>
                            <span className="sidebar-category-count">{category.count}</span>
                          </a>
                        </li>
                      ))}
                  </ul>
                  <div className="view-all-tags">
                    <a
                      href={normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`)}
                      className="view-all-link"
                    >
                      {t('lucid.home.allCategories', 'All categories →')}
                    </a>
                  </div>
                </>
              )}
            </section>
            <section className="sidebar-section">
              <h2 className="sidebar-title">{t('lucid.home.collections', 'Collections')}</h2>
              {allCollections.length === 0 ? (
                <p className="sidebar-hint">
                  {t('lucid.home.noCollections', 'No collections yet.')}
                </p>
              ) : (
                <ul className="sidebar-collections">
                  {allCollections.slice(0, 5).map((collection, index) => (
                    <li key={collection.slug}>
                      <a
                        href={normalizeHrefInRuntime(`${base}${collection.route}`)}
                        className="sidebar-collection-link"
                      >
                        <span className="sidebar-collection-index">0{index + 1}</span>
                        <span className="sidebar-collection-copy">
                          <span className="sidebar-collection-title">{collection.title}</span>
                          {collection.description && (
                            <span className="sidebar-collection-description">
                              {collection.description}
                            </span>
                          )}
                        </span>
                        <span className="sidebar-collection-count">
                          {t('lucid.home.collectionCount', `${collection.count} posts`, {
                            count: collection.count,
                          })}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        )}

        <main className="main-content lucid-latest">
          <header className="blog-header">
            <div>
              <p className="lucid-eyebrow">Latest</p>
              <h2 className="blog-title">{lucidConfig.postsTitle}</h2>
            </div>
            <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.routePrefix}`)}>
              {t('lucid.home.viewAll', 'View all posts →')}
            </a>
          </header>
          {recentPosts.length > 0 ? (
            <PostCardList posts={recentPosts as Post[]} />
          ) : (
            <p className="sidebar-hint">{t('lucid.home.empty', 'There are no more posts yet.')}</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
