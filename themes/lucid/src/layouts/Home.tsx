import type { LayoutProps } from '@cogita/shared';
import { PostList, TagCloud } from '@cogita/ui';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';
import { allTags, tagsConfig } from 'virtual-tags-data';

const HomeLayout: React.FC<LayoutProps> = () => {
  // 使用 Rspress 的 usePageData hook 获取页面数据和配置
  const pageData = usePageData();
  const config = pageData?.siteData || {};

  // 从配置中读取站点信息
  const siteDescription = config?.description;

  // 从 themeConfig 中读取自定义配置（可选）
  const themeConfig = config?.themeConfig as ThemeConfig | undefined;
  const postsTitle = themeConfig?.postsTitle || '最新文章';

  return (
    <div className="home-layout">
      <div className="home-content">
        <aside className="home-sidebar">
          <section className="sidebar-section">
            <h2 className="sidebar-title">标签</h2>
            <TagCloud tags={allTags} config={tagsConfig.tagCloud} />
          </section>
          <section className="sidebar-section sidebar-placeholder">
            <h2 className="sidebar-title">合集</h2>
            <p className="sidebar-hint">即将推出</p>
          </section>
        </aside>

        <main className="main-content">
          <header className="blog-header">
            <h1 className="blog-title">最新文章</h1>
            <p className="blog-subtitle">记录编码、创造与思考的瞬间</p>
          </header>
          <PostList posts={allPosts} showTags={true} />
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
