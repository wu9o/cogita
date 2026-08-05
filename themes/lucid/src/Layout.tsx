import type React from 'react';

// 简洁的RSS订阅组件（右上角）
const RSSLinks: React.FC = () => {
  const feedMeta: { rssUrl?: string; atomUrl?: string; jsonUrl?: string } = {
    rssUrl: '/cogita/rss.xml',
    atomUrl: '/cogita/atom.xml',
    jsonUrl: '/cogita/feed.json',
  };

  return (
    <div className="header-rss-links">
      {feedMeta.rssUrl && (
        <a
          href={feedMeta.rssUrl}
          className="header-rss-link"
          title="订阅RSS"
          target="_blank"
          rel="noopener noreferrer"
        >
          📡
        </a>
      )}
      {feedMeta.atomUrl && (
        <a
          href={feedMeta.atomUrl}
          className="header-rss-link"
          title="订阅Atom"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⚛️
        </a>
      )}
      {feedMeta.jsonUrl && (
        <a
          href={feedMeta.jsonUrl}
          className="header-rss-link"
          title="订阅JSON Feed"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗
        </a>
      )}
    </div>
  );
};

// 主布局组件
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="theme-container">
      <header className="site-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Cogita Blog</h1>
            <p>我思，故我在</p>
          </div>
          <RSSLinks />
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="site-footer">
        <p>Powered by Cogita</p>
      </footer>
    </div>
  );
};

export default Layout;
