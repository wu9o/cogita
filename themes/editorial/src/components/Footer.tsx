import { usePageData } from '@rspress/runtime';

interface FooterConfig {
  message?: string;
  copyright?: string;
}

/** 渲染主题页脚，并保留用户在 themeConfig 中配置的消息和版权信息。 */
export default function Footer() {
  const { siteData } = usePageData();
  const footer = siteData?.themeConfig?.footer as FooterConfig | undefined;

  if (!footer) return null;

  // 保留已有页脚 HTML 配置，以兼容 RSS 等订阅链接。
  const footerMessageProps = footer.message
    ? { dangerouslySetInnerHTML: { __html: footer.message } }
    : undefined;

  return (
    <footer className="editorial-footer">
      <div className="editorial-footer-inner">
        {footer.message && <div className="editorial-footer-message" {...footerMessageProps} />}
        {footer.copyright && <p className="editorial-footer-copyright">{footer.copyright}</p>}
      </div>
    </footer>
  );
}
