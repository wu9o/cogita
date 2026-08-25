import { usePageData } from '@rspress/runtime';

/**
 * Footer 配置类型
 */
interface FooterConfig {
  enabled?: boolean;
  message?: string;
  copyright?: string;
}

/**
 * 全局页脚组件
 *
 * 通过 globalUIComponents 注册到所有页面
 * 从 themeConfig.footer 读取配置并渲染
 *
 * 样式定义在 theme.css 中（.lucid-footer, .lucid-footer-container 等）
 *
 * 注意：这是一个默认导出的组件，用于 Rspress 的 globalUIComponents
 */
export default function Footer() {
  const { siteData } = usePageData();
  const footer = siteData?.themeConfig?.footer as FooterConfig | undefined;

  // 默认显示轻量页脚，只有显式关闭时才不渲染。
  if (footer?.enabled === false) {
    return null;
  }

  const siteTitle = siteData?.title || 'Cogita';
  const year = new Date().getFullYear();
  const message = footer?.message || `用心构建 · ${siteTitle}`;
  const copyright = footer?.copyright || `© ${year} ${siteTitle}`;

  return (
    <footer className="lucid-footer">
      <div className="lucid-footer-container">
        {message && (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Footer message 需要支持 HTML 内容（由用户在配置中提供）
          <div className="lucid-footer-message" dangerouslySetInnerHTML={{ __html: message }} />
        )}
        {copyright && <p className="lucid-footer-copyright">{copyright}</p>}
      </div>
    </footer>
  );
}
