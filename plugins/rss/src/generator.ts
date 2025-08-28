/**
 * RSS生成器核心类
 */
import type { PostFrontmatter } from '@cogita/plugin-posts-frontmatter';
import type { FeedMeta, JSONFeed, RSSConfig, RSSItem, RequiredRSSConfig } from './types';

export class RSSGenerator {
  private config: RequiredRSSConfig;
  private siteUrl: string;

  constructor(config: RSSConfig, siteUrl: string) {
    this.config = this.normalizeConfig(config);
    this.siteUrl = siteUrl.replace(/\/$/, ''); // 移除尾部斜杠
  }

  /**
   * 标准化配置，设置默认值
   */
  private normalizeConfig(config: RSSConfig): RequiredRSSConfig {
    return {
      title: config.title,
      description: config.description,
      link: config.link,
      language: config.language || 'zh-CN',
      copyright: config.copyright || '',
      managingEditor: config.managingEditor || '',
      webMaster: config.webMaster || '',
      formats: config.formats || ['rss'],
      feedPath: config.feedPath || 'rss.xml',
      atomPath: config.atomPath || 'atom.xml',
      jsonPath: config.jsonPath || 'feed.json',
      maxItems: config.maxItems || 20,
      includeContent: config.includeContent || false,
      customFields: {
        author: config.customFields?.author || 'author',
        category: config.customFields?.category || 'categories',
      },
    };
  }

  /**
   * 将Post数据转换为RSS项目
   */
  private convertPostToRSSItem(post: PostFrontmatter): RSSItem {
    const fullUrl = `${this.siteUrl}${post.route}`;

    // 获取作者信息
    const author = (post as any)[this.config.customFields.author];

    // 获取分类信息
    const categoryField = (post as any)[this.config.customFields.category];
    const categories = Array.isArray(categoryField) ? categoryField : post.tags || [];

    return {
      title: post.title,
      description: post.description || post.title,
      link: fullUrl,
      guid: fullUrl,
      pubDate: new Date(post.createDate).toUTCString(),
      author: author || undefined,
      category: categories.length > 0 ? categories : undefined,
      content: this.config.includeContent ? undefined : undefined, // 后续支持完整内容
    };
  }

  /**
   * 生成RSS 2.0 XML
   */
  generateRSS(posts: PostFrontmatter[]): string {
    const items = posts
      .slice(0, this.config.maxItems)
      .map((post) => this.convertPostToRSSItem(post));

    const rssItems = items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      ${item.author ? `<author>${item.author}</author>` : ''}
      ${item.category?.map((cat) => `<category><![CDATA[${cat}]]></category>`).join('') || ''}
    </item>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${this.config.title}]]></title>
    <description><![CDATA[${this.config.description}]]></description>
    <link>${this.config.link}</link>
    <language>${this.config.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Cogita RSS Plugin</generator>
    ${this.config.copyright ? `<copyright><![CDATA[${this.config.copyright}]]></copyright>` : ''}
    ${this.config.managingEditor ? `<managingEditor>${this.config.managingEditor}</managingEditor>` : ''}
    ${this.config.webMaster ? `<webMaster>${this.config.webMaster}</webMaster>` : ''}
    ${rssItems}
  </channel>
</rss>`.trim();
  }

  /**
   * 生成Atom XML
   */
  generateAtom(posts: PostFrontmatter[]): string {
    const items = posts
      .slice(0, this.config.maxItems)
      .map((post) => this.convertPostToRSSItem(post));

    const atomEntries = items
      .map(
        (item) => `
  <entry>
    <title type="html"><![CDATA[${item.title}]]></title>
    <link href="${item.link}" />
    <id>${item.guid}</id>
    <updated>${new Date(item.pubDate).toISOString()}</updated>
    <summary type="html"><![CDATA[${item.description}]]></summary>
    ${item.author ? `<author><name>${item.author}</name></author>` : ''}
  </entry>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8" ?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title><![CDATA[${this.config.title}]]></title>
  <subtitle><![CDATA[${this.config.description}]]></subtitle>
  <link href="${this.config.link}" />
  <link href="${this.siteUrl}/${this.config.atomPath}" rel="self" />
  <id>${this.config.link}</id>
  <updated>${new Date().toISOString()}</updated>
  <generator uri="https://github.com/wu9o/cogita">Cogita RSS Plugin</generator>
  ${atomEntries}
</feed>`.trim();
  }

  /**
   * 生成JSON Feed
   */
  generateJSON(posts: PostFrontmatter[]): string {
    const items = posts
      .slice(0, this.config.maxItems)
      .map((post) => this.convertPostToRSSItem(post));

    const feed: JSONFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: this.config.title,
      home_page_url: this.config.link,
      feed_url: `${this.siteUrl}/${this.config.jsonPath}`,
      description: this.config.description,
      generator: 'Cogita RSS Plugin',
      items: items
        .map((item) => ({
          id: item.guid,
          title: item.title,
          content_html: item.description,
          url: item.link,
          date_published: new Date(item.pubDate).toISOString(),
          author: item.author ? { name: item.author } : undefined,
          tags: item.category,
        }))
        .filter((item) => item !== undefined),
    };

    return JSON.stringify(feed, null, 2);
  }

  /**
   * 生成Feed元数据，用于HTML发现
   */
  generateFeedMeta(): FeedMeta {
    const meta: FeedMeta = {};

    if (this.config.formats.includes('rss')) {
      meta.rssUrl = `${this.siteUrl}/${this.config.feedPath}`;
    }
    if (this.config.formats.includes('atom')) {
      meta.atomUrl = `${this.siteUrl}/${this.config.atomPath}`;
    }
    if (this.config.formats.includes('json')) {
      meta.jsonUrl = `${this.siteUrl}/${this.config.jsonPath}`;
    }

    return meta;
  }

  /**
   * 生成HTML link标签
   */
  generateFeedLinks(feedMeta: FeedMeta): string {
    const linkTags = [];

    if (feedMeta.rssUrl) {
      linkTags.push(
        `<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="${feedMeta.rssUrl}" />`
      );
    }
    if (feedMeta.atomUrl) {
      linkTags.push(
        `<link rel="alternate" type="application/atom+xml" title="Atom Feed" href="${feedMeta.atomUrl}" />`
      );
    }
    if (feedMeta.jsonUrl) {
      linkTags.push(
        `<link rel="alternate" type="application/json" title="JSON Feed" href="${feedMeta.jsonUrl}" />`
      );
    }

    return linkTags.join('\n  ');
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig(): RequiredRSSConfig {
    return { ...this.config };
  }
}
