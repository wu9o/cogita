import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { defineConfig } from 'rspress/config'
import * as path from 'node:path';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  base: process.env.NODE_ENV === 'production' ? '/cogita/' : '/',
  title: 'wu9o\'s Blog',
  description: 'Personal blog powered by Cogita - A comprehensive blog system based on Rspress',
  icon: '/favicon.ico',
  logo: {
    light: '/logo-light.png',
    dark: '/logo-dark.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/wu9o',
      },
    ],
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Blog',
        link: '/blog',
      },
      {
        text: 'About',
        link: '/about',
      },
    ],
    footer: {
      message: 'Powered by Cogita & Rspress',
    },
  },
  plugins: [
    pluginPostsFrontmatter({
      postsDir: path.join(__dirname, 'docs', 'posts'),
      routePrefix: 'blog',
    }),
  ]
});
