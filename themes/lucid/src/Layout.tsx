import type React from 'react';
import './theme.css';

// This is now a wrapper layout, so it receives children.
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="theme-container">
      <header className="header">
        <h1>My Lucid Blog</h1>
        <p>A clean space for thoughts.</p>
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
