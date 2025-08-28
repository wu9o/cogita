import type React from "react";

// RSS订阅链接组件
const RSSLinks: React.FC = () => {
  // 使用默认的RSS路径，实际的元数据在构建时由RSS插件注入
  const feedMeta: { rssUrl?: string; atomUrl?: string; jsonUrl?: string } = {
    rssUrl: "/rss.xml",
    atomUrl: "/atom.xml",
    jsonUrl: "/feed.json",
  };

  return (
    <div className="rss-links">
      {feedMeta.rssUrl && (
        <a
          href={feedMeta.rssUrl}
          className="rss-link"
          title="订阅RSS"
          target="_blank"
          rel="noopener noreferrer"
        >
          📡 RSS
        </a>
      )}
      {feedMeta.atomUrl && (
        <a
          href={feedMeta.atomUrl}
          className="rss-link"
          title="订阅Atom"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⚛️ Atom
        </a>
      )}
      {feedMeta.jsonUrl && (
        <a
          href={feedMeta.jsonUrl}
          className="rss-link"
          title="订阅JSON Feed"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 JSON
        </a>
      )}
    </div>
  );
};

// This is now a wrapper layout, so it receives children.
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="theme-container">
      <header className="header">
        <div className="header-content">
          <div className="header-text">
            <h1>My Lucid Blog</h1>
            <p>A clean space for thoughts.</p>
          </div>
          <RSSLinks />
        </div>
      </header>
      <main className="main-content">
        {/* The actual page content rendered by Rspress will be here */}
        {children}
      </main>
      <footer className="footer">
        <p>Powered by Cogita</p>
      </footer>
    </div>
  );
};

export default Layout;
