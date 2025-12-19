import type React from 'react';

/**
 * 主题包装器 Layout
 *
 * 注意：这个 Layout 在 Cogita 当前架构中不会被使用
 * Rspress 会直接使用它的默认 Layout 包裹页面内容
 *
 * RSS 链接应该通过 themeConfig.footer 和 socialLinks 配置
 */

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default Layout;
