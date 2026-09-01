import type { LayoutProps } from '@cogita/shared';
import { TagCloud, TagList } from '@cogita/ui';
import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import { allTags, getRelatedTags, tagsConfig } from 'virtual-tags-data';
import { PostCardList } from '../components/PostCard';
import { t } from '../i18n';
import { formatDate, getBase, getPageRoute } from '../utils';

/**
 * 标签页面布局（索引页 + 详情页共用）
 * 消费 virtual-tags-data 虚拟模块，根据当前 URL 路径判断渲染哪种页面：
 * - /tags（无 slug）→ 标签索引页：TagCloud 展示所有标签
 * - /tags/:slug → 标签详情页：文章卡片列表 + TagList 渲染相关标签
 *
 * 注意：
 * - 路由优先从 Rspress 页面数据读取，浏览器路径仅作为运行时回退
 * - <a> 标签不经过 rspress 路由，不会自动加 base 前缀，需从 siteData.base 手动拼接
 * - 中文 slug 在 URL 中被 encodeURI，需 decodeURIComponent 还原
 */
const TagPageLayout: React.FC<LayoutProps> = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const tagsHref = normalizeHrefInRuntime(`${base}/tags`);

  const route = getPageRoute(pageData, base).replace(/^\/+/, '');
  const tagPrefix = tagsConfig.routePrefix.replace(/^\/+|\/+$/g, '');
  const slug = route.startsWith(`${tagPrefix}/`) ? route.slice(`${tagPrefix}/`.length) : '';

  // 索引页：无 slug，展示标签云
  if (!slug) {
    return (
      <div className="tag-page">
        <header className="tag-header">
          <h1 className="tag-title">{t('lucid.tag.title', 'Topic cloud')}</h1>
          <p className="tag-meta">
            {t('lucid.tag.total', `${allTags.length} topics`, { count: allTags.length })}
          </p>
        </header>
        <section className="tag-cloud-section">
          <TagCloud tags={allTags} config={tagsConfig.tagCloud} className="lucid-tag-cloud" />
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
          ← {t('lucid.tag.back', 'Back to topic index')}
        </a>
        <p className="tag-empty">{t('lucid.tag.notFound', 'Topic not found.')}</p>
      </div>
    );
  }

  const relatedTags = getRelatedTags(tag.name, 8);
  // 文章引用补齐 url/filePath 字段，供主题卡片渲染。
  const posts = tag.posts.map((p) => ({ ...p, filePath: '', url: p.route }));

  return (
    <div className="tag-page">
      <header className="tag-header">
        <a href={tagsHref} className="tag-back">
          ← {t('lucid.tag.back', 'Back to topic index')}
        </a>
        <h1 className="tag-title">#{tag.name}</h1>
        <p className="tag-meta">
          {t(
            'lucid.tag.meta',
            `${tag.count} posts · Updated ${formatDate(tag.posts[0]?.createDate)}`,
            { count: tag.count }
          )}
        </p>
      </header>

      <section className="tag-posts">
        <PostCardList posts={posts} />
      </section>

      {relatedTags.length > 0 && (
        <section className="tag-related">
          <h2 className="tag-section-title">{t('lucid.tag.related', 'Related topics')}</h2>
          <TagList tags={relatedTags.map((t) => t.name)} variant="compact" />
        </section>
      )}
    </div>
  );
};

export default TagPageLayout;
