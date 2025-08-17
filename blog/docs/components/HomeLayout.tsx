import { usePageData } from '@rspress/runtime';
import React from 'react';
import { Link } from 'rspress/theme';
// 从插件创建的虚拟模块中导入文章数据
import { allPosts } from 'virtual-posts-data';

export const HomeLayout = () => {
  const siteData = usePageData();

  return (
    <div className="home-layout" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="hero" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{siteData.title}</h1>
        <p>{siteData.description}</p>
      </div>
      <div className="posts">
        <h2
          style={{
            borderBottom: '1px solid var(--rp-c-divider-light)',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          最新文章
        </h2>
        <ul>
          {allPosts.map((post) => (
            <li key={post.route} style={{ listStyle: 'none', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>
                <Link href={post.route}>{post.title}</Link>
              </h3>
              <p style={{ color: 'var(--rp-c-text-2)', margin: '0' }}>
                {new Date(post.createDate).toLocaleDateString()}
              </p>
              {post.description && <p style={{ margin: '0.5rem 0 0' }}>{post.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
