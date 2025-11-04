import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';

// RSS订阅提示组件
const RSSSubscriptionBanner: React.FC = () => {
  // 使用默认的RSS路径
  const feedMeta: { rssUrl?: string; atomUrl?: string; jsonUrl?: string } = {
    rssUrl: '/rss.xml',
    atomUrl: '/atom.xml',
    jsonUrl: '/feed.json',
  };

  const hasFeeds = feedMeta.rssUrl || feedMeta.atomUrl || feedMeta.jsonUrl;

  if (!hasFeeds) {
    return null;
  }

  return (
    <div className="rss-subscription-banner">
      <div className="rss-banner-content">
        <div className="rss-banner-text">
          <h3>📡 订阅本博客</h3>
          <p>通过RSS阅读器获取最新文章更新，随时随地阅读精彩内容</p>
        </div>
        <div className="rss-banner-links">
          {feedMeta.rssUrl && (
            <a href={feedMeta.rssUrl} className="rss-banner-link rss-primary">
              📡 RSS订阅
            </a>
          )}
          {feedMeta.atomUrl && (
            <a href={feedMeta.atomUrl} className="rss-banner-link">
              ⚛️ Atom
            </a>
          )}
          {feedMeta.jsonUrl && (
            <a href={feedMeta.jsonUrl} className="rss-banner-link">
              🔗 JSON Feed
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const HomeLayout: React.FC<LayoutProps> = () => {
  return (
    <div>
      <RSSSubscriptionBanner />
      <PostList posts={allPosts} />
    </div>
  );
};

export default HomeLayout;
