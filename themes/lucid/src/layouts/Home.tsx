import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import { usePageData } from '@rspress/runtime';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';

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
      {/* 简洁的博客头部 */}
      <header className="blog-header">
        <h1 className="blog-title">最新文章</h1>
        <p className="blog-subtitle">记录编码、创造与思考的瞬间</p>
      </header>
      
      {/* 主要内容：文章列表 */}
      <main className="main-content">
        <PostList posts={allPosts} showTags={true} />
      </main>
    </div>
  );
};

export default HomeLayout;
