import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';

const HomeLayout: React.FC<LayoutProps> = () => {
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
