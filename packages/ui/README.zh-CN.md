# @cogita/ui

[![npm version](https://badge.fury.io/js/@cogita%2Fui.svg)](https://badge.fury.io/js/@cogita%2Fui)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)

**中文** | [English](./README.md)

> 用于构建 Cogita 主题和插件的共享、可主题化 UI 组件

## 这是什么？

`@cogita/ui` 提供了专为博客和内容网站设计的 React 组件集合。这些组件针对可读性、无障碍性和主题化进行了优化。

## 安装

```bash
# 使用 pnpm
pnpm add @cogita/ui

# 使用 npm  
npm install @cogita/ui

# 使用 yarn
yarn add @cogita/ui
```

**Peer 依赖：**
```bash
pnpm add react react-dom @rspress/runtime @rspress/theme-default
```

## 快速开始

### 基础使用

```tsx
import { PostList, Button } from '@cogita/ui';
import type { Post } from '@cogita/ui';

function BlogHome() {
  const posts: Post[] = [
    {
      title: '我的第一篇文章',
      route: '/posts/first-post', 
      createDate: '2024-01-01',
      updateDate: '2024-01-01',
      // ... 其他字段
    }
  ];

  return (
    <div>
      <h1>我的博客</h1>
      <PostList posts={posts} />
      <Button variant="primary" onClick={() => alert('你好！')}>
        阅读更多
      </Button>
    </div>
  );
}
```

### 导入样式

```tsx
// 导入基础样式（通常在应用入口）
import '@cogita/ui/styles';

// 或导入特定组件样式
import '@cogita/ui/components/PostList/style';
```

## 组件

### 内容组件

#### `PostList`

显示博客文章列表，支持自定义渲染。

```tsx
import { PostList } from '@cogita/ui';

<PostList
  posts={posts}
  renderItem={(post) => (
    <div>
      <h2>{post.title}</h2>
      <time>{post.createDate}</time>
    </div>
  )}
/>
```

**Props：**
- `posts: Post[]` - 文章数据数组
- `renderItem?: (post: Post) => ReactNode` - 自定义渲染函数
- `loading?: boolean` - 显示加载状态
- `emptyText?: string` - 无文章时的文本

#### `PostItem`

单个文章项组件，在 PostList 中使用。

```tsx
import { PostItem } from '@cogita/ui';

<PostItem
  post={post}
  showExcerpt={true}
  showTags={true}
  titleLevel={2}
/>
```

### 交互组件

#### `Button`

多功能按钮组件，支持多种变体。

```tsx
import { Button } from '@cogita/ui';

// 基础使用
<Button onClick={handleClick}>点击我</Button>

// 变体
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>

// 尺寸
<Button size="small">小按钮</Button>
<Button size="large">大按钮</Button>

// 状态
<Button loading>加载中...</Button>
<Button disabled>禁用</Button>
```

### 展示组件

#### `TagList`

显示标签，支持点击处理。

```tsx
import { TagList } from '@cogita/ui';

<TagList
  tags={['React', 'TypeScript', 'Cogita']}
  onTagClick={(tag) => console.log(tag)}
/>
```

## 数据类型

### `Post`

主要文章数据接口。

```tsx
interface Post {
  title: string;
  description?: string;
  route: string;
  url: string;
  createDate: string;
  updateDate: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  cover?: string;
}
```

## 主题化

### CSS 变量

使用 CSS 变量自定义外观：

```css
:root {
  /* 颜色 */
  --cogita-primary: #007acc;
  --cogita-text-primary: #333;
  --cogita-bg-primary: #fff;
  
  /* 间距 */
  --cogita-space-sm: 8px;
  --cogita-space-md: 16px;
  --cogita-space-lg: 24px;
  
  /* 字体 */
  --cogita-font-size-base: 16px;
  --cogita-font-family: system-ui, sans-serif;
}
```

### 暗色模式

```css
[data-theme='dark'] {
  --cogita-primary: #58a6ff;
  --cogita-text-primary: #f0f6fc;
  --cogita-bg-primary: #0d1117;
}
```

### 自定义组件样式

```css
.my-custom-post-list {
  --cogita-post-item-padding: 24px;
  --cogita-post-item-radius: 8px;
}

.my-custom-post-list .cogita-post-item {
  background: var(--cogita-bg-secondary);
  border: 1px solid var(--cogita-border);
}
```

## 在主题中使用

### 基础主题布局

```tsx
// themes/my-theme/src/layouts/Home.tsx
import { PostList } from '@cogita/ui';
import { allPosts } from 'virtual-posts-data';

const HomeLayout: React.FC = () => {
  return (
    <div className="theme-container">
      <header>
        <h1>我的博客</h1>
      </header>
      <main>
        <PostList posts={allPosts} />
      </main>
    </div>
  );
};
```

### 自定义渲染

```tsx
<PostList
  posts={posts}
  renderItem={(post) => (
    <article className="custom-post">
      <h2>{post.title}</h2>
      {post.cover && <img src={post.cover} alt={post.title} />}
      <p>{post.description}</p>
      <div className="post-meta">
        <time>{post.createDate}</time>
        {post.tags && <TagList tags={post.tags} />}
      </div>
    </article>
  )}
/>
```

## 性能

### Tree Shaking

只导入需要的内容：

```tsx
// 推荐：按名称导入
import { PostList } from '@cogita/ui/PostList';
import { Button } from '@cogita/ui/Button';

// 避免：完整导入
import { PostList, Button } from '@cogita/ui';
```

### 懒加载

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@cogita/ui/HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/wu9o/cogita.git
cd cogita

# 安装依赖
pnpm install

# 开发组件
pnpm --filter @cogita/ui dev

# 构建组件
pnpm --filter @cogita/ui build

# 运行测试
pnpm --filter @cogita/ui test
```

## 了解更多

- 📖 [完整文档](../../docs/README.md)
- 🔧 [API 参考](../../docs/api-reference.md)
- 💡 [最佳实践](../../docs/best-practices.md)
- 🎨 [主题开发](../../docs/theme-development.md)

## 相关包

- [🧠 @cogita/core](../core) - 核心博客引擎
- [🚀 @cogita/cli](../cli) - 命令行界面
- [🌟 @cogita/theme-lucid](../../themes/lucid) - 默认主题

## 许可证

MIT © [wu9o](https://github.com/wu9o)