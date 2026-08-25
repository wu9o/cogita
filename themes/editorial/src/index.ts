import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginBlogList } from '@cogita/plugin-blog-list';
import { pluginCategories } from '@cogita/plugin-categories';
import { pluginCodeCopy } from '@cogita/plugin-code-copy';
import { pluginCollections } from '@cogita/plugin-collections';
import { pluginComments } from '@cogita/plugin-comments';
import { pluginContentCheck } from '@cogita/plugin-content-check';
import { pluginImages } from '@cogita/plugin-images';
import { pluginPostsFrontmatter } from '@cogita/plugin-posts-frontmatter';
import { pluginReadingProgress } from '@cogita/plugin-reading-progress';
import { pluginRSS } from '@cogita/plugin-rss';
import { pluginSearch } from '@cogita/plugin-search';
import { pluginSEO } from '@cogita/plugin-seo';
import { pluginSitemap } from '@cogita/plugin-sitemap';
import { pluginTags } from '@cogita/plugin-tags';
import type { CogitaTheme } from '@cogita/shared';

/**
 * Editorial 主题配置。
 *
 * 主题只负责页面结构、视觉系统和插件声明，文章扫描、搜索、RSS 等业务能力仍由插件提供。
 */
export function getThemeConfig(): CogitaTheme {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    name: '@cogita/theme-editorial',
    capabilities: {
      required: ['content.posts'],
    },
    pageLayouts: {
      home: './layouts/Home.js',
      tag: './layouts/Tag.js',
      collection: './layouts/Collection.js',
      blogList: './layouts/BlogList.js',
      archive: './layouts/Archive.js',
      search: './layouts/Search.js',
      category: './layouts/Category.js',
    },
    globalStyles: path.resolve(__dirname, './theme.css'),
    globalUIComponents: [
      path.resolve(__dirname, './components/ArticleChrome.js'),
      path.resolve(__dirname, './components/Footer.js'),
      path.resolve(__dirname, './components/CollectionNav.js'),
      path.resolve(__dirname, './components/ReadingProgress.js'),
      path.resolve(__dirname, './components/CodeCopy.js'),
      path.resolve(__dirname, './components/Comments.js'),
    ],
    plugins: [
      pluginPostsFrontmatter,
      pluginImages,
      pluginContentCheck,
      pluginRSS,
      pluginSitemap,
      pluginSEO,
      pluginTags,
      pluginCollections,
      pluginCategories,
      pluginComments,
      pluginCodeCopy,
      pluginBlogList,
      pluginSearch,
      pluginReadingProgress,
    ],
  };
}
