import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import { usePageData } from '@rspress/runtime';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';

/**
 * 首页布局组件
 *
 * 采用清晰的层级结构：
 * 1. Hero 区域（博客标题 + 副标题）
 * 2. 文章列表区域（章节标题 + 文章列表）
 *
 * 所有文本内容从配置中读取，支持完全自定义
 * RSS 订阅入口通过以下方式提供：
 * - 导航栏右上角的社交链接
 * - Hero 区域的内嵌链接
 * - 页脚的订阅链接
 */
const HomeLayout: React.FC<LayoutProps> = () => {
  // 使用 Rspress 的 usePageData hook 获取页面数据和配置
  const pageData = usePageData();
  const config = pageData?.siteData || {};

  // 从配置中读取站点信息
  const siteDescription = config?.description;

  // 从 themeConfig 中读取自定义配置（可选）
  const themeConfig = config?.themeConfig as any;
  const postsTitle = themeConfig?.postsTitle || '最新文章';

  return (
    <div className="home-layout">
      {/* Hero 区域 - 博客主标题和介绍 */}
      <section className="hero-section">
        {!!siteDescription?.length && <h1 className="hero-subtitle c-decs">{siteDescription}</h1>}
      </section>

      {/* 文章列表区域 */}
      <section className="posts-section">
        <h2 className="section-title c-post-title">{postsTitle}</h2>
        <PostList posts={allPosts} />
      </section>
    </div>
  );
};

export default HomeLayout;
