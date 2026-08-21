import type { RspressPlugin, UserConfig } from '@rspress/core';
import type React from 'react';

export const VIRTUAL_CONTENT_DIR = '.cogita_content';

// Export Rspress types for use in themes and plugins
export type { RspressPlugin, UserConfig };

// Enhanced config type for plugin factory functions
export interface CogitaPluginConfig {
  root: string;
  cwd: string;
  site?: {
    title?: string;
    description?: string;
    base?: string;
    url?: string;
  };
  posts?: {
    dir?: string;
    routePrefix?: string;
    extensions?: string[];
  };
  images?: {
    enabled?: boolean;
    dir?: string;
    extensions?: string[];
    readDimensions?: boolean;
    failOnMissing?: boolean;
    warnOnMissingAlt?: boolean;
  };
  sitemap?: {
    enabled?: boolean;
    path?: string;
    includeHome?: boolean;
    includePosts?: boolean;
    includeBlogList?: boolean;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    customUrls?: Array<{
      path: string;
      lastmod?: string;
      changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    }>;
    failOnMissingSiteUrl?: boolean;
  };
  seo?: {
    enabled?: boolean;
    defaultImage?: string;
    defaultImageAlt?: string;
    defaultDescription?: string;
    author?: string;
    robots?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
    includeJsonLd?: boolean;
    audit?: {
      enabled?: boolean;
      failOnError?: boolean;
      reportPath?: string;
      minDescriptionLength?: number;
    };
  };
  markdown?: UserConfig['markdown'];
  mediumZoom?: UserConfig['mediumZoom'];
  rss?: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    formats?: ('rss' | 'atom' | 'json')[];
    maxItems?: number;
    feedPath?: string;
    atomPath?: string;
    jsonPath?: string;
    includeContent?: boolean;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    customFields?: {
      author?: string;
      category?: string;
    };
    [key: string]: unknown;
  };
  tags?: {
    enabled?: boolean;
    routePrefix?: string;
    tagCloud?: {
      minFontSize?: number;
      maxFontSize?: number;
      sortBy?: 'name' | 'count' | 'date';
      limit?: number;
    };
    excludeTags?: string[];
    minPostCount?: number;
    [key: string]: unknown;
  };
  collections?: {
    enabled?: boolean;
    routePrefix?: string;
    metadata?: Record<string, { title?: string; description?: string; cover?: string }>;
    excludeCollections?: string[];
    minPostCount?: number;
    [key: string]: unknown;
  };
  blogList?: {
    enabled?: boolean;
    routePrefix?: string;
    pageSize?: number;
    sortBy?: 'createDate' | 'updateDate' | 'title';
    order?: 'asc' | 'desc';
    generateArchives?: boolean;
    archivePrefix?: string;
    archiveGranularity?: 'year' | 'month';
    [key: string]: unknown;
  };
  _framework?: {
    version: string;
    buildTime: string;
  };
  /**
   * 主题布局组件的绝对路径映射（由 core 框架注入，插件可用其作为 addPages 的 filepath）
   * 键名对应 CogitaTheme.pageLayouts 的键，如 home / tag / tagIndex
   */
  themeLayouts?: Record<string, string>;
  strict?: boolean;
  [key: string]: unknown;
}

// 插件工厂函数接收最终配置并返回 Rspress 插件。
export type CogitaPluginFactory = (
  config: CogitaPluginConfig
) => RspressPlugin | RspressPlugin[] | null | undefined;

/** 文章列表页面生成路由时所需的最小文章数据。 */
export interface BlogListRoutePost {
  createDate?: string;
}

/** 文章列表与归档路由配置。 */
export interface BlogListRouteConfig {
  routePrefix?: string;
  pageSize?: number;
  generateArchives?: boolean;
  archivePrefix?: string;
  archiveGranularity?: 'year' | 'month';
}

function normalizeRoutePrefix(prefix: string | undefined, fallback: string): string {
  const normalized = (prefix || fallback).trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}

/** 根据文章数量和日期分组结果生成列表、分页与归档路由。 */
export function getBlogListRoutes(
  posts: BlogListRoutePost[],
  config: BlogListRouteConfig = {}
): string[] {
  const routePrefix = normalizeRoutePrefix(config.routePrefix, 'archive');
  const archivePrefix = normalizeRoutePrefix(config.archivePrefix, 'archives');
  const pageSize = Math.max(1, Math.floor(config.pageSize || 10));
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const routes = [
    `/${routePrefix}`,
    ...Array.from({ length: totalPages - 1 }, (_, index) => `/${routePrefix}/page/${index + 2}`),
  ];

  if (config.generateArchives === false) {
    return routes;
  }

  const granularity = config.archiveGranularity === 'month' ? 'month' : 'year';
  const archiveKeys = new Set<string>();
  for (const post of posts) {
    const match = /^(\d{4})(?:-(\d{2}))?/.exec(post.createDate || '');
    if (!match) continue;
    archiveKeys.add(granularity === 'month' && match[2] ? `${match[1]}-${match[2]}` : match[1]);
  }

  if (archiveKeys.size > 0) {
    routes.push(`/${archivePrefix}`);
    routes.push(
      ...Array.from(archiveKeys)
        .sort((a, b) => b.localeCompare(a))
        .map((key) => `/${archivePrefix}/${key}`)
    );
  }

  return routes;
}

export interface CogitaTheme {
  name: string;
  pageLayouts: {
    home: string;
    /** 标签详情页布局（路由 /tags/:slug） */
    tag?: string;
    /** 标签索引页布局（路由 /tags） */
    tagIndex?: string;
    /** 合集详情页布局（路由 /collections/:slug） */
    collection?: string;
    /** 合集索引页布局（路由 /collections） */
    collectionIndex?: string;
    /** 文章列表页布局（路由 /archive） */
    blogList?: string;
    /** 文章归档页布局（路由 /archives/:key） */
    archive?: string;
    [key: string]: string | undefined;
  };
  globalStyles?: string;
  globalUIComponents?: (string | [string, object])[];
  plugins?: CogitaPluginFactory[];
}

export interface LayoutProps {
  routePath: string;
  config: UserConfig;
  pageData: Record<string, unknown>;
  children?: React.ReactNode;
}

/**
 * 简单的字符串哈希函数（32 位整数）
 * @param str 输入字符串
 * @returns 哈希值
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * 生成 URL 友好的标签 slug
 * 支持中文字符（保留 \u4e00-\u9fff），其余非字母数字替换为连字符
 * 注意：中文 slug 在 URL 中需 encodeURI，部分路由匹配场景可能有兼容性问题
 * @param tagName 标签名称
 * @returns URL slug；若结果为空则用哈希兜底（如 tag-12345678）
 */
export function generateTagSlug(tagName: string): string {
  return (
    tagName
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || `tag-${Math.abs(hashCode(tagName))}`
  );
}
