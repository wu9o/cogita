import type React from 'react';

/**
 * 主题包装器 Layout
 *
 * 注意：此 Layout 组件在当前架构中不被使用
 * Rspress 会使用其默认布局包裹页面内容
 *
 * Footer 通过 globalUIComponents 注册，会自动在所有页面显示
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default Layout;
