# RSS插件架构设计与实现方案

**文档版本**: 1.0  
**创建日期**: 2025年1月  
**插件名称**: `@cogita/plugin-rss`  
**依赖**: `@cogita/plugin-posts-frontmatter`

## 📋 概述

RSS订阅插件是Cogita博客系统的重要组成部分，负责生成RSS 2.0、Atom和JSON Feed等多种订阅格式，并自动在HTML中添加feed发现链接，提升SEO表现。

## 🏗️ 架构设计

### 数据流架构

```
Posts数据源 → RSS生成器 → 静态Feed文件 → HTML链接注入
     ↓           ↓           ↓            ↓
虚拟模块     XML/JSON      构建输出     SEO优化
```

### 核心组件

1. **RSSGenerator**: 核心生成器，负责不同格式的feed生成
2. **插件钩子系统**: 利用Rspress插件生命周期
3. **配置管理**: 灵活的配置选项和默认值
4. **类型定义**: 完整的TypeScript类型支持

## 🎯 核心特性

### ✅ 基础功能
- RSS 2.0 标准格式生成
- Atom Feed 现代标准支持  
- JSON Feed API友好格式
- 自动HTML链接注入
- 多语言支持

### ✅ 高级功能
- 自定义字段映射
- 内容过滤和排序
- 可配置输出路径
- 完整内容包含选项
- SEO元数据自动生成

## 📝 类型定义

```typescript
// RSS配置接口
export interface RSSConfig {
  // 基础配置
  title: string;
  description: string;
  link: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  
  // 输出配置
  formats?: ('rss' | 'atom' | 'json')[];
  feedPath?: string; // 默认 'rss.xml'
  atomPath?: string; // 默认 'atom.xml' 
  jsonPath?: string; // 默认 'feed.json'
  
  // 内容配置
  maxItems?: number; // 默认 20
  includeContent?: boolean; // 是否包含完整内容
  
  // 自定义字段映射
  customFields?: {
    author?: string; // frontmatter字段名
    category?: string;
  };
}

// RSS项目数据结构
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  author?: string;
  category?: string[];
  content?: string;
}

// Feed元数据
export interface FeedMeta {
  rssUrl?: string;
  atomUrl?: string;
  jsonUrl?: string;
}
```

## 🔧 实现架构

### 插件钩子生命周期

```typescript
export function pluginRSS(config: RSSConfig): RspressPlugin {
  let generator: RSSGenerator;
  let posts: PostFrontmatter[] = [];
  let feedMeta: FeedMeta = {};

  return {
    name: '@cogita/plugin-rss',

    // 1. 构建前准备
    async beforeBuild() {
      // 初始化生成器
      generator = new RSSGenerator(config, siteUrl);
      
      // 获取文章数据 (依赖posts-frontmatter插件)
      const postsModule = await import('virtual-posts-data');
      posts = postsModule.allPosts || [];
      
      // 生成feed元数据
      feedMeta = generator.generateFeedMeta();
    },

    // 2. 添加静态页面
    addPages() {
      const pages = [];
      
      if (generator.config.formats.includes('rss')) {
        pages.push({
          routePath: `/${generator.config.feedPath}`,
          content: generator.generateRSS(posts),
          _isRawFile: true, // 原始文件，跳过markdown处理
        });
      }
      
      // ... 其他格式
      return pages;
    },

    // 3. 添加虚拟模块
    addRuntimeModules() {
      return {
        'virtual-rss-meta': `export const feedMeta = ${JSON.stringify(feedMeta)};`
      };
    },

    // 4. HTML注入
    modifyHTML(html: string) {
      // 自动添加 <link rel="alternate"> 标签
      const linkTags = this.generateFeedLinks(feedMeta);
      return html.replace('</head>', `  ${linkTags}\n</head>`);
    }
  };
}
```

### RSS生成器核心

```typescript
export class RSSGenerator {
  private config: Required<RSSConfig>;
  private siteUrl: string;

  constructor(config: RSSConfig, siteUrl: string) {
    this.config = this.normalizeConfig(config);
    this.siteUrl = siteUrl.replace(/\/$/, '');
  }

  /**
   * 生成RSS 2.0 XML
   */
  generateRSS(posts: PostFrontmatter[]): string {
    const items = this.convertPostsToRSSItems(posts);
    
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${this.config.title}]]></title>
    <description><![CDATA[${this.config.description}]]></description>
    <link>${this.config.link}</link>
    <language>${this.config.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Cogita RSS Plugin</generator>
    ${this.generateChannelFields()}
    ${this.generateRSSItems(items)}
  </channel>
</rss>`;
  }

  /**
   * 生成Atom XML
   */
  generateAtom(posts: PostFrontmatter[]): string {
    const items = this.convertPostsToRSSItems(posts);
    
    return `<?xml version="1.0" encoding="UTF-8" ?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title><![CDATA[${this.config.title}]]></title>
  <subtitle><![CDATA[${this.config.description}]]></subtitle>
  <link href="${this.config.link}" />
  <link href="${this.siteUrl}/${this.config.atomPath}" rel="self" />
  <id>${this.config.link}</id>
  <updated>${new Date().toISOString()}</updated>
  <generator uri="https://github.com/wu9o/cogita">Cogita RSS Plugin</generator>
  ${this.generateAtomEntries(items)}
</feed>`;
  }

  /**
   * 生成JSON Feed
   */
  generateJSON(posts: PostFrontmatter[]): string {
    const items = this.convertPostsToRSSItems(posts);
    
    const feed = {
      version: "https://jsonfeed.org/version/1.1",
      title: this.config.title,
      home_page_url: this.config.link,
      feed_url: `${this.siteUrl}/${this.config.jsonPath}`,
      description: this.config.description,
      generator: "Cogita RSS Plugin",
      items: this.generateJSONItems(items)
    };

    return JSON.stringify(feed, null, 2);
  }
}
```

## 🎯 使用配置

### 基础配置

```typescript
// cogita.config.ts
import { defineConfig } from '@cogita/core';

export default defineConfig({
  site: {
    title: '我的博客',
    description: '记录技术与生活',
    url: 'https://myblog.com'
  },
  
  theme: 'lucid',
  
  plugins: [
    {
      name: '@cogita/plugin-rss',
      options: {
        title: '我的博客 RSS',
        description: '最新文章订阅',
        link: 'https://myblog.com',
        language: 'zh-CN'
      }
    }
  ]
});
```

### 高级配置

```typescript
// 完整配置示例
export default defineConfig({
  plugins: [
    {
      name: '@cogita/plugin-rss',
      options: {
        // 基础信息
        title: '我的技术博客 RSS',
        description: '分享前端技术、架构设计、开发经验',
        link: 'https://techblog.com',
        language: 'zh-CN',
        copyright: '版权所有 © 2025 我的博客',
        managingEditor: 'author@techblog.com (作者)',
        webMaster: 'webmaster@techblog.com (网站管理员)',
        
        // 输出配置
        formats: ['rss', 'atom', 'json'],
        feedPath: 'feeds/rss.xml',
        atomPath: 'feeds/atom.xml',
        jsonPath: 'feeds/feed.json',
        
        // 内容配置
        maxItems: 50,
        includeContent: false, // 只包含摘要，不包含全文
        
        // 字段映射
        customFields: {
          author: 'author',
          category: 'categories'
        }
      }
    }
  ]
});
```

## 🔄 依赖关系

### 插件依赖链

```
@cogita/plugin-posts-frontmatter (数据源)
           ↓
@cogita/plugin-rss (RSS生成)
           ↓
HTML输出 (SEO优化)
```

### 数据流依赖

1. **输入依赖**: 依赖`virtual-posts-data`模块获取文章数据
2. **配置依赖**: 依赖站点配置获取基础信息
3. **构建依赖**: 依赖Rspress构建系统生成静态文件

## 🚀 实施计划

### Phase 1: 基础功能 (1-2周)

**🎯 目标**: 实现基本的RSS 2.0生成功能

- [ ] 创建插件基础结构
  - [ ] 目录结构: `plugins/rss/`
  - [ ] 基础文件: `src/plugin.ts`, `src/types.ts`, `src/generator.ts`
  - [ ] 配置文件: `package.json`, `tsconfig.json`, `rslib.config.ts`

- [ ] 实现核心RSS生成器
  - [ ] `RSSGenerator`类基础结构
  - [ ] RSS 2.0 XML生成逻辑
  - [ ] Post数据转换逻辑

- [ ] 插件钩子系统
  - [ ] `beforeBuild`: 数据准备和生成器初始化
  - [ ] `addPages`: RSS文件页面添加
  - [ ] `modifyHTML`: HTML链接注入

- [ ] 基础配置系统
  - [ ] 类型定义
  - [ ] 默认配置
  - [ ] 配置验证

**📋 验收标准**:
- 能够生成有效的RSS 2.0 XML文件
- 正确解析posts-frontmatter数据
- 自动在HTML中添加RSS发现链接
- 基础错误处理和日志输出

### Phase 2: 多格式支持 (1周)

**🎯 目标**: 添加Atom和JSON Feed格式支持

- [ ] Atom Feed生成
  - [ ] `generateAtom`方法实现
  - [ ] Atom XML模板和数据映射
  - [ ] 时间格式转换(ISO 8601)

- [ ] JSON Feed生成
  - [ ] `generateJSON`方法实现
  - [ ] JSON数据结构设计
  - [ ] 内容类型设置

- [ ] 多格式配置
  - [ ] `formats`配置选项
  - [ ] 路径配置(`feedPath`, `atomPath`, `jsonPath`)
  - [ ] 条件生成逻辑

**📋 验收标准**:
- 支持同时生成RSS, Atom, JSON三种格式
- 格式间数据一致性
- 正确的MIME类型和文件扩展名

### Phase 3: 高级特性 (1周)

**🎯 目标**: 完善高级功能和优化

- [ ] 内容增强
  - [ ] `includeContent`选项支持完整文章内容
  - [ ] 内容截取和摘要生成
  - [ ] HTML内容安全处理

- [ ] 自定义字段映射
  - [ ] `customFields`配置实现
  - [ ] 动态字段提取
  - [ ] 字段验证和默认值

- [ ] 高级配置选项
  - [ ] `maxItems`限制
  - [ ] 排序和过滤选项
  - [ ] 缓存优化

- [ ] 错误处理和调试
  - [ ] 详细的错误信息
  - [ ] 调试模式和日志级别
  - [ ] 优雅降级处理

**📋 验收标准**:
- 所有配置选项正常工作
- 完善的错误处理机制
- 详细的文档和示例

## 📊 技术优势

### 1. 架构优势
- **松耦合设计**: 通过虚拟模块与其他插件解耦
- **标准兼容**: 支持主流RSS标准和现代格式
- **SEO友好**: 自动HTML元数据注入
- **类型安全**: 完整TypeScript支持

### 2. 性能优势  
- **构建时生成**: 零运行时开销
- **缓存友好**: 静态文件利于CDN缓存
- **按需生成**: 只生成配置的格式
- **内存优化**: 流式处理大量文章

### 3. 开发体验
- **零配置启动**: 智能默认配置
- **灵活定制**: 丰富的配置选项
- **调试友好**: 详细日志和错误信息
- **文档完善**: 包含使用示例和最佳实践

### 4. 扩展能力
- **插件生态**: 可与其他插件无缝集成
- **自定义过滤**: 支持复杂的内容过滤逻辑
- **主题集成**: 可被主题自动包含
- **国际化**: 多语言和本地化支持

## 🔍 技术细节

### XML生成策略
- 使用模板字符串而非XML库，减少依赖
- 正确的CDATA处理，确保内容安全
- 符合W3C标准的XML声明和命名空间

### 错误处理机制
- 优雅降级：缺少依赖时给出警告但不中断构建
- 数据验证：验证必需字段，提供默认值
- 调试信息：详细的控制台输出便于问题排查

### 性能优化
- 惰性加载：仅在需要时导入依赖模块
- 内存管理：及时释放大对象引用
- 并发安全：避免插件间的竞态条件

## 📚 相关文档

- [Cogita Plugin Development Guide](./plugin-development.md)
- [Architecture Design Document](./architecture-design.md)
- [Posts Frontmatter Plugin](../plugins/posts-frontmatter/README.md)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Atom Specification](https://www.ietf.org/rfc/rfc4287.txt)
- [JSON Feed Specification](https://jsonfeed.org/version/1.1)

---

**下一步**: 开始Phase 1的实际代码实现，创建基础的插件结构和RSS生成功能。
