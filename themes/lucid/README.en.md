# @cogita/theme-lucid

[![npm version](https://badge.fury.io/js/@cogita%2Ftheme-lucid.svg)](https://badge.fury.io/js/@cogita%2Ftheme-lucid)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)

[中文](./README.md) | **English**

> The default theme for Cogita - A lucid, content-focused blog theme.

## What is it?

Lucid is Cogita's official default theme, designed with "clarity" as its core principle. It focuses on content readability and user experience with a modern, clean design that gets out of the way and lets your content shine.

## Features

- 🎯 **Content First**: Clean typography and spacing optimized for reading
- 🌙 **Smart Theming**: Auto light/dark mode with smooth transitions  
- 📱 **Mobile Ready**: Responsive design that works on all devices
- ⚡ **Performance**: Fast loading with optimized CSS and JavaScript
- ♿ **Accessible**: WCAG compliant with keyboard navigation support

## Quick Start

### Installation

```bash
pnpm add @cogita/core @cogita/theme-lucid
```

### Basic Setup

Create `cogita.config.ts`:

```typescript
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: 'My Lucid Blog',
    description: 'A blog powered by Cogita Lucid theme',
  },
  theme: 'lucid',
});
```

Create your first post in `posts/welcome.md`:

```markdown
---
title: "Welcome to Lucid"
description: "Exploring the elegant design of the Lucid theme"
createDate: "2024-01-01"
tags: ["cogita", "lucid", "blog"]
---

# Welcome to Lucid

Lucid theme provides clean, modern design for your blog...
```

Start development:

```bash
pnpm dev
```

## Configuration

### Basic Theme Config

```typescript
export default defineConfig({
  site: {
    title: 'My Blog',
    description: 'A personal blog',
  },
  theme: 'lucid',
  
  themeConfig: {
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      { text: 'Contact', link: '/contact' },
    ],
    
    // Social links
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/you' },
      { icon: 'x', mode: 'link', content: 'https://x.com/you' },
      { icon: 'rss', mode: 'link', content: '/rss.xml' },
    ],
    
    // Footer
    footer: {
      message: '© 2024 My Blog. Built with ❤️ and Cogita',
    },
    
    // Theme mode
    colorMode: 'auto', // 'light' | 'dark' | 'auto'
  },
});
```

### Advanced Navigation

```typescript
themeConfig: {
  nav: [
    { text: 'Home', link: '/' },
    {
      text: 'Posts',
      items: [
        { text: 'Tech Articles', link: '/posts/tech' },
        { text: 'Life Stories', link: '/posts/life' },
      ],
    },
    { text: 'About', link: '/about' },
  ],
}
```

## Theme Features

### Automatic Blog Functionality

- **Post List**: Homepage automatically displays your latest posts
- **Post Pages**: Individual post pages with optimized reading experience
- **Pagination**: Automatic pagination for large numbers of posts
- **Reading Time**: Estimated reading time calculation

### Built-in Plugins

Lucid automatically includes:

- `@cogita/plugin-posts-frontmatter` - Extracts post metadata
- More plugins coming soon...

### SEO Optimized

- Automatic meta tag generation
- Open Graph tags for social sharing
- Structured data markup
- Optimized loading performance

## Customization

### CSS Variables

Override theme colors and spacing:

```css
/* styles/custom.css */
:root {
  /* Brand colors */
  --lucid-primary: #007acc;
  --lucid-primary-hover: #005a99;
  
  /* Typography */
  --lucid-font-family: 'Inter', system-ui, sans-serif;
  --lucid-font-size-base: 16px;
  
  /* Spacing */
  --lucid-space-unit: 8px;
  
  /* Layout */
  --lucid-content-width: 800px;
  --lucid-radius: 6px;
}

/* Dark mode overrides */
[data-theme='dark'] {
  --lucid-primary: #58a6ff;
  --lucid-bg-primary: #0d1117;
  --lucid-text-primary: #f0f6fc;
}
```

Import in your config:

```typescript
export default defineConfig({
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'link',
          attrs: { rel: 'stylesheet', href: '/styles/custom.css' }
        }
      ]
    }
  }
});
```

### Custom Components

Override theme components by creating custom layouts:

```tsx
// components/CustomPostItem.tsx
import { PostItem } from '@cogita/ui';
import type { Post } from '@cogita/ui';

export const CustomPostItem: React.FC<{ post: Post }> = ({ post }) => (
  <article className="custom-post-item">
    <h2>{post.title}</h2>
    {post.cover && <img src={post.cover} alt={post.title} />}
    <p>{post.description}</p>
    <div className="meta">
      <time>{post.createDate}</time>
      {post.tags && (
        <div className="tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </article>
);
```

## Content Guidelines

### Post Frontmatter

```yaml
---
title: "Your Post Title"
description: "Brief description for SEO and social sharing"
createDate: "2024-01-01"
updateDate: "2024-01-15"
tags: ["tag1", "tag2"]
categories: ["category1"]
author: "Author Name"
cover: "./cover.jpg"
featured: true
---
```

### Supported Content

- **Markdown**: Standard Markdown with extensions
- **MDX**: React components in Markdown (planned)
- **Images**: Automatic optimization and lazy loading
- **Code**: Syntax highlighting with Prism.js

## Performance

### Optimization Features

- **Lazy Loading**: Images and non-critical content
- **Code Splitting**: Automatic route-based splitting
- **CSS Optimization**: Critical CSS inlining
- **Asset Optimization**: Automatic compression and caching

### Build Configuration

```typescript
export default defineConfig({
  builderConfig: {
    // Performance optimizations
    output: {
      assetPrefix: 'https://cdn.example.com/',
    },
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});
```

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 768px  
- **Desktop**: 768px - 1024px
- **Large**: > 1024px

### Mobile Optimizations

- Touch-friendly navigation
- Optimized font sizes
- Simplified layouts
- Fast loading on slow connections

## SEO Features

### Automatic Meta Tags

```html
<meta property="og:title" content="Your Post Title" />
<meta property="og:description" content="Post description" />
<meta property="og:image" content="Post cover image" />
<meta name="twitter:card" content="summary_large_image" />
```

### Structured Data

Automatic JSON-LD generation for:
- Blog posts
- Author information
- Organization data
- Breadcrumb navigation

## Troubleshooting

### Common Issues

**Theme not loading:**
```bash
# Check if theme is properly installed
npm list @cogita/theme-lucid

# Verify config
export default defineConfig({
  theme: 'lucid', // Should be string, not import
});
```

**Styling issues:**
```bash
# Check CSS import order
import '@cogita/ui/styles'; // Should come first
import './custom.css';      // Then custom styles
```

**Posts not showing:**
```bash
# Check posts directory structure
posts/
  └── your-post.md  # Should have proper frontmatter
```

## Learn More

- 📖 [Complete Documentation](../../docs/README.md)
- 🎨 [Theme Development Guide](../../docs/theme-development.md)
- 💡 [Best Practices](../../docs/best-practices.md)
- 🔧 [API Reference](../../docs/api-reference.md)

## Related Packages

- [🧠 @cogita/core](../../packages/core) - Core blog engine
- [🚀 @cogita/cli](../../packages/cli) - Command line tools
- [🎨 @cogita/ui](../../packages/ui) - UI components

## License

MIT © [wu9o](https://github.com/wu9o)