import type { LayoutProps } from '@cogita/shared';
import { usePageData } from '@rspress/runtime';
import type React from 'react';

/** 主题首页的最小布局，业务数据应通过插件能力提供。 */
const HomeLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const title = pageData?.siteData?.title || 'Cogita';
  const description = pageData?.siteData?.description || '主题驱动的静态站点。';

  return (
    <main className="starter-home">
      <p className="starter-home-eyebrow">Cogita theme starter</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
};

export default HomeLayout;
