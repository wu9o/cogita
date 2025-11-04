# @cogita/ui

[![npm version](https://badge.fury.io/js/@cogita%2Fui.svg)](https://badge.fury.io/js/@cogita%2Fui)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)

[中文](./README.md) | **English**

> Shared, themeable UI components for building Cogita themes and plugins.

## What is it?

`@cogita/ui` provides a collection of React components specifically designed for blog and content websites. These components are optimized for readability, accessibility, and theming.

## Installation

```bash
# Using pnpm
pnpm add @cogita/ui

# Using npm  
npm install @cogita/ui

# Using yarn
yarn add @cogita/ui
```

**Peer Dependencies:**
```bash
pnpm add react react-dom @rspress/runtime @rspress/theme-default
```

## Quick Start

### Basic Usage

```tsx
import { PostList, Button } from '@cogita/ui';
import type { Post } from '@cogita/ui';

function BlogHome() {
  const posts: Post[] = [
    {
      title: 'My First Post',
      route: '/posts/first-post', 
      createDate: '2024-01-01',
      updateDate: '2024-01-01',
      // ... other fields
    }
  ];

  return (
    <div>
      <h1>My Blog</h1>
      <PostList posts={posts} />
      <Button variant="primary" onClick={() => alert('Hello!')}>
        Read More
      </Button>
    </div>
  );
}
```

### Import Styles

```tsx
// Import base styles (typically in app entry)
import '@cogita/ui/styles';

// Or import specific component styles
import '@cogita/ui/components/PostList/style';
```

## Components

### Content Components

#### `PostList`

Display a list of blog posts with customizable rendering.

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

**Props:**
- `posts: Post[]` - Array of post data
- `renderItem?: (post: Post) => ReactNode` - Custom render function
- `loading?: boolean` - Show loading state
- `emptyText?: string` - Text when no posts

#### `PostItem`

Individual post item component, used within PostList.

```tsx
import { PostItem } from '@cogita/ui';

<PostItem
  post={post}
  showExcerpt={true}
  showTags={true}
  titleLevel={2}
/>
```

### Interactive Components

#### `Button`

Versatile button component with multiple variants.

```tsx
import { Button } from '@cogita/ui';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="large">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Display Components  

#### `TagList`

Display tags with optional click handlers.

```tsx
import { TagList } from '@cogita/ui';

<TagList
  tags={['React', 'TypeScript', 'Cogita']}
  onTagClick={(tag) => console.log(tag)}
/>
```

## Data Types

### `Post`

Main post data interface.

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

## Theming

### CSS Variables

Customize appearance using CSS variables:

```css
:root {
  /* Colors */
  --cogita-primary: #007acc;
  --cogita-text-primary: #333;
  --cogita-bg-primary: #fff;
  
  /* Spacing */
  --cogita-space-sm: 8px;
  --cogita-space-md: 16px;
  --cogita-space-lg: 24px;
  
  /* Typography */
  --cogita-font-size-base: 16px;
  --cogita-font-family: system-ui, sans-serif;
}
```

### Dark Mode

```css
[data-theme='dark'] {
  --cogita-primary: #58a6ff;
  --cogita-text-primary: #f0f6fc;
  --cogita-bg-primary: #0d1117;
}
```

### Custom Component Styles

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

## Usage in Themes

### Basic Theme Layout

```tsx
// themes/my-theme/src/layouts/Home.tsx
import { PostList } from '@cogita/ui';
import { allPosts } from 'virtual-posts-data';

const HomeLayout: React.FC = () => {
  return (
    <div className="theme-container">
      <header>
        <h1>My Blog</h1>
      </header>
      <main>
        <PostList posts={allPosts} />
      </main>
    </div>
  );
};
```

### Custom Rendering

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

## Performance

### Tree Shaking

Import only what you need:

```tsx
// Recommended: Named imports
import { PostList } from '@cogita/ui/PostList';
import { Button } from '@cogita/ui/Button';

// Avoid: Full imports  
import { PostList, Button } from '@cogita/ui';
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@cogita/ui/HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Development

```bash
# Clone repository
git clone https://github.com/wu9o/cogita.git
cd cogita

# Install dependencies
pnpm install

# Develop components
pnpm --filter @cogita/ui dev

# Build components
pnpm --filter @cogita/ui build

# Run tests
pnpm --filter @cogita/ui test
```

## Learn More

- 📖 [Complete Documentation](../../docs/README.md)
- 🔧 [API Reference](../../docs/api-reference.md)
- 💡 [Best Practices](../../docs/best-practices.md)
- 🎨 [Theme Development](../../docs/theme-development.md)

## Related Packages

- [🧠 @cogita/core](../core) - Core blog engine  
- [🚀 @cogita/cli](../cli) - Command line interface
- [🌟 @cogita/theme-lucid](../../themes/lucid) - Default theme

## License

MIT © [wu9o](https://github.com/wu9o)