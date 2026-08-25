import type { LayoutProps } from '@cogita/shared';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';

/** 技术文档首页，提供手册入口和框架定位说明。 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = pageData?.siteData?.base || '';
  const title = pageData?.siteData?.title || 'Cogita';
  const description = pageData?.siteData?.description || '主题驱动的静态站点框架。';

  return (
    <main className="docs-home">
      <section className="docs-home-hero">
        <p className="docs-home-eyebrow">{title} · Documentation</p>
        <h1>{description}</h1>
        <p className="docs-home-lead">
          从配置、主题到插件，了解如何用约定优于配置的方式构建可维护的静态站点。
        </p>
        <div className="docs-home-actions">
          <a href={normalizeHrefInRuntime(base.concat('/getting-started'))}>开始使用</a>
          <a href={normalizeHrefInRuntime(base.concat('/api/architecture-design'))}>了解架构</a>
        </div>
      </section>

      <section className="docs-home-grid" aria-label="文档入口">
        <a
          href={normalizeHrefInRuntime(base.concat('/getting-started'))}
          className="docs-home-card"
        >
          <span>01</span>
          <strong>快速开始</strong>
          <small>从安装、配置到部署，快速构建第一个站点。</small>
        </a>
        <a
          href={normalizeHrefInRuntime(base.concat('/api/architecture-design'))}
          className="docs-home-card"
        >
          <span>02</span>
          <strong>架构设计</strong>
          <small>掌握 Core、主题和插件的公共接口。</small>
        </a>
        <a
          href={normalizeHrefInRuntime(base.concat('/plugins/plugin-api-specification'))}
          className="docs-home-card"
        >
          <span>03</span>
          <strong>插件开发</strong>
          <small>为站点增加构建能力、数据处理和运行时功能。</small>
        </a>
      </section>

      <section className="docs-home-system" aria-label="框架能力">
        <div className="docs-home-system-copy">
          <p className="docs-home-section-label">A clear boundary</p>
          <h2>站点内容与框架能力，各自独立演进。</h2>
          <p>
            Cogita 仓库维护可复用的 Core、主题和插件；博客、知识库与项目手册作为独立站点安装这些包。
          </p>
        </div>
        <div className="docs-home-flow" aria-label="构建流程">
          <span>配置</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>主题</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>插件</span>
          <span className="docs-home-flow-arrow">→</span>
          <span>静态输出</span>
        </div>
      </section>
    </main>
  );
};

export default HomeLayout;
