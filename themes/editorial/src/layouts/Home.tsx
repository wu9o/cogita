import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allCategories, categoriesConfig } from 'virtual-categories-data';
import { allCollections } from 'virtual-collections-data';
import { allPosts } from 'virtual-posts-data';
import { allTags, tagsConfig } from 'virtual-tags-data';
import { PostCard, PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { addPostCovers, getBase, getEditorialConfig } from '../utils';

/** Editorial 主题首页，突出主推文章和最近更新，聚合入口放在辅助区域。 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const posts = addPostCovers(allPosts);
  const editorialConfig = getEditorialConfig(pageData);
  const featuredPost = editorialConfig.featuredPost;
  const configuredFeatured = featuredPost
    ? posts.find(
        (post) =>
          post.route === featuredPost || post.route === `/${featuredPost.replace(/^\/+/, '')}`
      )
    : undefined;
  const featured = configuredFeatured || posts[0];
  const recent = posts.filter((post) => post.route !== featured?.route).slice(0, 5);
  const siteTitle = pageData?.siteData?.title || 'Cogita';
  const siteDescription =
    pageData?.siteData?.description || 'A journal for building, debugging, and thinking.';

  return (
    <div className="editorial-home">
      <section className="editorial-hero">
        <p className="editorial-eyebrow">
          {editorialConfig.heroEyebrow || `${siteTitle} · Journal`}
        </p>
        <h1>{siteDescription}</h1>
        <p className="editorial-hero-copy">{editorialConfig.heroCopy}</p>
        <nav
          className="editorial-hero-links"
          aria-label={t('editorial.home.navigation', 'Blog navigation')}
        >
          <a href={normalizeHrefInRuntime(`${base}/archive`)}>
            {t('editorial.home.allPosts', 'Browse all posts')}
          </a>
          <a href={normalizeHrefInRuntime(`${base}/search`)}>
            {t('editorial.home.search', 'Search articles')}
          </a>
        </nav>
      </section>

      {featured && (
        <section className="editorial-featured-section" aria-labelledby="editorial-featured-title">
          <div className="editorial-section-heading">
            <div>
              <p className="editorial-eyebrow">Featured</p>
              <h2 id="editorial-featured-title">
                {t('editorial.home.featured', 'Featured reading')}
              </h2>
            </div>
          </div>
          <PostCard post={featured} featured />
        </section>
      )}

      <div className="editorial-home-grid">
        <main>
          <div className="editorial-section-heading">
            <div>
              <p className="editorial-eyebrow">Latest</p>
              <h2>{t('editorial.home.latest', 'Latest updates')}</h2>
            </div>
            <a href={normalizeHrefInRuntime(`${base}/archive`)}>
              {t('editorial.home.viewAll', 'View all →')}
            </a>
          </div>
          {recent.length > 0 ? (
            <PostCardList posts={recent} />
          ) : (
            <p>{t('editorial.home.empty', 'There are no more posts yet.')}</p>
          )}
        </main>

        <aside className="editorial-home-aside">
          <section className="editorial-aside-section">
            <div className="editorial-aside-heading">
              <span>Topics</span>
              <a href={normalizeHrefInRuntime(`${base}/${tagsConfig.routePrefix}`)}>
                {t('editorial.home.all', 'All')}
              </a>
            </div>
            <div className="editorial-topic-list">
              {allTags.slice(0, 12).map((tag) => (
                <a key={tag.slug} href={normalizeHrefInRuntime(`${base}${tag.route}`)}>
                  {tag.name}
                </a>
              ))}
            </div>
          </section>

          <section className="editorial-aside-section">
            <div className="editorial-aside-heading">
              <span>Categories</span>
              <a href={normalizeHrefInRuntime(`${base}/${categoriesConfig.routePrefix}`)}>
                {t('editorial.home.all', 'All')}
              </a>
            </div>
            <ul className="editorial-link-list">
              {allCategories
                .filter((category) => category.depth === 0)
                .slice(0, 6)
                .map((category) => (
                  <li key={category.path}>
                    <a href={normalizeHrefInRuntime(`${base}${category.route}`)}>
                      <span>{category.title}</span>
                      <small>{category.count}</small>
                    </a>
                  </li>
                ))}
            </ul>
          </section>

          {allCollections.length > 0 && (
            <section className="editorial-aside-section">
              <div className="editorial-aside-heading">
                <span>Collections</span>
              </div>
              <ul className="editorial-link-list">
                {allCollections.slice(0, 4).map((collection) => (
                  <li key={collection.slug}>
                    <a href={normalizeHrefInRuntime(`${base}${collection.route}`)}>
                      <span>{collection.title}</span>
                      <small>{collection.count}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default HomeLayout;
