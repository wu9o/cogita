import { normalizeHrefInRuntime, usePageData } from '@rspress/runtime';
import type React from 'react';
import {
  getBacklinks,
  getContentRelations,
  getOutgoingLinks,
} from 'virtual-content-relations-data';
import { getBase, getHref, getPageRoute } from '../utils';

function RelationList({
  title,
  items,
  base,
}: {
  title: string;
  items: Array<{ title: string; route: string; kind: 'post' | 'document' }>;
  base: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="knowledge-relations-section">
      <h3>{title}</h3>
      <ul>
        {items.slice(0, 6).map((item) => (
          <li key={`${title}-${item.route}`}>
            <a href={normalizeHrefInRuntime(getHref(base, item.route))}>{item.title}</a>
            <span>{item.kind === 'document' ? '文档' : '文章'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 在内容页尾部展示出链和反向链接，形成知识库的可回溯阅读路径。 */
const Relations: React.FC = () => {
  const pageData = usePageData();
  const base = getBase(pageData);
  const route = getPageRoute(pageData, base);
  const relation = getContentRelations(route);
  const outbound = getOutgoingLinks(route);
  const inbound = getBacklinks(route);

  if (relation.outbound.length === 0 && relation.inbound.length === 0) return null;

  return (
    <aside className="knowledge-relations" aria-label="内容关系">
      <div className="knowledge-relations-heading">
        <span>Knowledge graph</span>
        <strong>继续探索</strong>
      </div>
      <div className="knowledge-relations-groups">
        <RelationList title="本文链接到" items={outbound} base={base} />
        <RelationList title="反向链接" items={inbound} base={base} />
      </div>
    </aside>
  );
};

export default Relations;
