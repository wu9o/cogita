import type { LayoutProps } from '@cogita/shared';
import { PostList, TagCloud, TagList } from '@cogita/ui';
import { usePageData } from '@rspress/runtime';
import type React from 'react';
import { allTags, getRelatedTags, tagsConfig } from 'virtual-tags-data';

/**
 * 标签页面布局（索引页 + 详情页共用）
 * 消费 virtual-tags-data 虚拟模块，根据当前 URL 路径判断渲染哪种页面：
 * - /tags（无 slug）→ 标签索引页：TagCloud 展示所有标签
 * - /tags/:slug → 标签详情页：PostList 渲染文章 + TagList 渲染相关标签
 *
 * 注意：
 * - rspress 的 addPages filepath 组件不通过 props 传 routePath，用 window.location.pathname 获取
 * - <a> 标签不经过 rspress 路由，不会自动加 base 前缀，需从 siteData.base 手动拼接
 * - 中文 slug 在 URL 中被 encodeURI，需 decodeURIComponent 还原
 */
const TagPageLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  // base 形如 '/cogita/'，去掉尾斜杠便于拼接
  const base = (pageData?.siteData?.base || '').replace(/\/$/, '');
  const tagsHref = `${base}/tags`;

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // pathname 形如 /cogita/tags/版本控制.html（中文被 encodeURI 成 %XX），需 decodeURIComponent
  const rawSlug =
    pathname
      .split('/tags/')[1]
      ?.replace(/\.html$/, '')
      .replace(/\/$/, '') || '';
  const slug = decodeURIComponent(rawSlug);

  // 索引页：无 slug，展示标签云
  if (!slug) {
    return (
      <div className="tag-page">
        <header className="tag-header">
          <h1 className="tag-title">标签云</h1>
          <p className="tag-meta">共 {allTags.length} 个标签</p>
        </header>
        <section className="tag-cloud-section">
          <TagCloud tags={allTags} config={tagsConfig.tagCloud} />
        </section>
      </div>
    );
  }

  // 详情页：按 slug 查找标签
  const tag = allTags.find((t) => t.slug === slug);

  if (!tag) {
    return (
      <div className="tag-page">
        <a href={tagsHref} className="tag-back">
          ← 返回标签索引
        </a>
        <p className="tag-empty">标签不存在</p>
      </div>
    );
  }

  const relatedTags = getRelatedTags(tag.name, 8);
  // PostList 需要 Post 类型，PostReference 补齐 url/filePath 字段
  const posts = tag.posts.map((p) => ({ ...p, filePath: '', url: p.route }));

  return (
    <div className="tag-page">
      <header className="tag-header">
        <a href={tagsHref} className="tag-back">
          ← 返回标签索引
        </a>
        <h1 className="tag-title">#{tag.name}</h1>
        <p className="tag-meta">
          {tag.count} 篇文章 · 最近更新{' '}
          {new Date(tag.posts[0]?.createDate).toLocaleDateString('zh-CN')}
        </p>
      </header>

      <section className="tag-posts">
        <PostList posts={posts} showTags={false} />
      </section>

      {relatedTags.length > 0 && (
        <section className="tag-related">
          <h2 className="tag-section-title">相关标签</h2>
          <TagList tags={relatedTags.map((t) => t.name)} variant="compact" />
        </section>
      )}
    </div>
  );
};

export default TagPageLayout;
