import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { t } from 'virtual-cogita-i18n-text';

/** 技术文档首页，提供手册入口和框架定位说明。 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = pageData?.siteData?.base || '';
  const title = pageData?.siteData?.title || 'Cogita';
  const description = pageData?.siteData?.description || 'A theme-driven static site framework.';
  const link = (path: string) =>
    normalizeHrefInRuntime(`${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);

  return (
    <main className="docs-home">
      <section className="docs-home-hero">
        <p className="docs-home-eyebrow">
          {title} · {t('docs.home.eyebrow', 'Documentation')}
        </p>
        <h1>{description}</h1>
        <p className="docs-home-lead">
          {t(
            'docs.home.lead',
            'Learn how to build maintainable static sites with conventions across configuration, themes, and plugins.'
          )}
        </p>
        <div className="docs-home-actions">
          <a href={link('/getting-started')}>{t('docs.home.getStarted', 'Get started')}</a>
          <a href={link('/api/architecture-design')}>
            {t('docs.home.architecture', 'Explore the architecture')}
          </a>
        </div>
      </section>

      <section
        className="docs-home-grid"
        aria-label={t('docs.home.entryPoints', 'Documentation entry points')}
      >
        <a href={link('/getting-started')} className="docs-home-card">
          <span>01</span>
          <strong>{t('docs.home.quickstart.title', 'Quick start')}</strong>
          <small>
            {t(
              'docs.home.quickstart.description',
              'Build your first site from installation to deployment.'
            )}
          </small>
        </a>
        <a href={link('/api/architecture-design')} className="docs-home-card">
          <span>02</span>
          <strong>{t('docs.home.architecture.title', 'Architecture')}</strong>
          <small>
            {t(
              'docs.home.architecture.description',
              'Understand the public contracts between Core, themes, and plugins.'
            )}
          </small>
        </a>
        <a href={link('/plugins/plugin-api-specification')} className="docs-home-card">
          <span>03</span>
          <strong>{t('docs.home.plugins.title', 'Plugin development')}</strong>
          <small>
            {t(
              'docs.home.plugins.description',
              'Add build capabilities, data processing, and runtime features to your site.'
            )}
          </small>
        </a>
      </section>

      <section
        className="docs-home-system"
        aria-label={t('docs.home.system.label', 'Framework model')}
      >
        <div className="docs-home-system-copy">
          <p className="docs-home-section-label">
            {t('docs.home.boundaries.label', 'Clear boundaries')}
          </p>
          <h2>
            {t(
              'docs.home.boundaries.title',
              'Site content and framework capabilities evolve independently.'
            )}
          </h2>
          <p>
            {t(
              'docs.home.boundaries.description',
              'The Cogita repository maintains reusable Core, themes, and plugins. Blogs, knowledge bases, and handbooks consume them as independent sites.'
            )}
          </p>
        </div>
        <div className="docs-home-flow" aria-label={t('docs.home.flow.label', 'Build flow')}>
          <span>{t('docs.home.flow.config', 'Config')}</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>{t('docs.home.flow.theme', 'Theme')}</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>{t('docs.home.flow.plugin', 'Plugin')}</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>{t('docs.home.flow.output', 'Static output')}</span>
        </div>
      </section>

      <section
        className="docs-home-themes"
        aria-label={t('docs.home.themes.label', 'Theme showcase')}
      >
        <div className="docs-home-themes-heading">
          <div>
            <p className="docs-home-section-label">
              {t('docs.home.themes.eyebrow', 'Choose a theme')}
            </p>
            <h2>{t('docs.home.themes.title', 'One framework for many content shapes.')}</h2>
          </div>
          <a href={link('/themes')}>{t('docs.home.themes.viewAll', 'View all themes →')}</a>
        </div>
        <div className="docs-home-theme-list">
          <a href={link('/themes')} className="docs-home-theme-card docs-home-theme-card-docs">
            <span>DOCS</span>
            <strong>{t('docs.home.themes.docs.title', 'Documentation theme')}</strong>
            <small>
              {t(
                'docs.home.themes.docs.description',
                'For project handbooks, API references, and knowledge bases.'
              )}
            </small>
          </a>
          <a
            href="https://github.com/wu9o/cogita/tree/main/themes/lucid"
            className="docs-home-theme-card docs-home-theme-card-lucid"
          >
            <span>LUCID</span>
            <strong>{t('docs.home.themes.lucid.title', 'Content-focused blog theme')}</strong>
            <small>
              {t(
                'docs.home.themes.lucid.description',
                'For personal blogs, article lists, and archives.'
              )}
            </small>
          </a>
          <a
            href="https://github.com/wu9o/cogita/tree/main/themes/editorial"
            className="docs-home-theme-card docs-home-theme-card-editorial"
          >
            <span>EDITORIAL</span>
            <strong>{t('docs.home.themes.editorial.title', 'Editorial theme')}</strong>
            <small>
              {t(
                'docs.home.themes.editorial.description',
                'For sites that prioritize reading rhythm and presentation.'
              )}
            </small>
          </a>
        </div>
      </section>
    </main>
  );
};

export default HomeLayout;
