import type { LayoutProps } from '@cogita/shared';
import { PostList, TagCloud } from '@cogita/ui';
import { normalizeHrefInRuntime } from '@rspress/runtime';
import { usePageData } from '@rspress/runtime';
import type React from 'react';
import { blogListConfig } from 'virtual-blog-list-data';
import { allCollections } from 'virtual-collections-data';
import { postCovers } from 'virtual-images-data';
import { allPosts } from 'virtual-posts-data';
import { allTags, tagsConfig } from 'virtual-tags-data';

/**
 * 首页布局组件
 *
 * 双栏结构：
 * - 左侧 aside：标签云（TagCloud）+ 合集列表
 * - 右侧 main：最新文章（PostList）
 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = (pageData?.siteData?.base || '').replace(/\/$/, '');
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

  return (
    <div className="home-layout">
      <div className="home-content">
        <aside className="home-sidebar">
          <section className="sidebar-section">
            <h2 className="sidebar-title">标签</h2>
            <TagCloud tags={allTags} config={tagsConfig.tagCloud} />
          </section>
          <section className="sidebar-section">
            <h2 className="sidebar-title">合集</h2>
            {allCollections.length === 0 ? (
              <p className="sidebar-hint">暂无合集</p>
            ) : (
              <ul className="sidebar-collections">
                {allCollections.slice(0, 5).map((collection) => (
                  <li key={collection.slug}>
                    <a href={`${base}${collection.route}`} className="sidebar-collection-link">
                      {collection.title}
                      <span className="sidebar-collection-count">{collection.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <main className="main-content">
          <header className="blog-header">
            <div>
              <h1 className="blog-title">最新文章</h1>
              <p className="blog-subtitle">记录编码、创造与思考的瞬间</p>
            </div>
            <a href={normalizeHrefInRuntime(`${base}/${blogListConfig.routePrefix}`)}>
              查看全部文章 →
            </a>
          </header>
          <PostList posts={postsWithCovers} showTags={true} showCover={true} />
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
