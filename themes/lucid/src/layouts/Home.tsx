import type { LayoutProps } from '@cogita/shared';
import { PostList } from '@cogita/ui';
import type React from 'react';
import { allPosts } from 'virtual-posts-data';

const HomeLayout: React.FC<LayoutProps> = () => {
  return (
    <div>
      <PostList posts={allPosts} />
    </div>
  );
};

export default HomeLayout;
