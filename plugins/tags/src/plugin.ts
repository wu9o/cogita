import type { CogitaPluginConfig } from '@cogita/shared';
import type { RspressPlugin } from '@rspress/core';
import type { TagData, TagsConfig } from './types';
import { 
  extractTagsFromPosts, 
  processTagsFromPosts, 
  calculateTagWeight,
  getRelatedTags,
  calculateTagStats 
} from './utils';

export function pluginTags(config: CogitaPluginConfig): RspressPlugin | null {
  // 配置验证和默认值处理
  const tagsConfig = config.tags;
  
  // 如果未配置或明确禁用，则跳过
  if (!tagsConfig || tagsConfig.enabled === false) {
    console.log('[Tags Plugin] Tags 配置未启用，跳过标签功能');
    return null;
  }
  
  // 创建完整的标签配置，应用默认值
  const finalTagsConfig = {
    enabled: true,
    routePrefix: tagsConfig.routePrefix || 'tags',
    tagCloud: {
      minFontSize: 12,
      maxFontSize: 24,
      minOpacity: 0.5,
      maxOpacity: 1.0,
      sortBy: 'count' as const,
      limit: 50,
      ...tagsConfig.tagCloud,
    },
    postsPerPage: tagsConfig.postsPerPage || 10,
    layout: (tagsConfig.layout as string) || 'tag',
    generateRss: tagsConfig.generateRss || false,
    tagTransform: (tagsConfig.tagTransform as (tag: string) => string) || ((tag: string) => tag),
    excludeTags: (tagsConfig.excludeTags as string[]) || [],
    minPostCount: (tagsConfig.minPostCount as number) || 1,
  };
  
  // 插件内部状态
  let allTagsData: TagData[] = [];
  let tagMap: Map<string, TagData> = new Map();
  let postsData: any[] = [];
  let tagStats: any = {};
  
  return {
    name: '@cogita/plugin-tags',
    
    async beforeBuild() {
      console.log('[Tags Plugin] 开始初始化标签插件...');
      
      try {
        // 获取文章配置
        const postsConfig = config.posts || {};
        const postsDir = postsConfig.dir || 'posts';
        const cwd = config.cwd || process.cwd();
        const routePrefix = postsConfig.routePrefix || 'posts';
        
        console.log(`[Tags Plugin] 扫描文章目录: ${postsDir}`);
        
        // 提取文章数据
        postsData = await extractTagsFromPosts(postsDir, cwd, routePrefix);
        
        if (postsData.length === 0) {
          console.warn('[Tags Plugin] 未找到文章，跳过标签处理');
          return;
        }
        
        // 处理标签数据
        const { tagsData, tagsMap: processedTagsMap } = processTagsFromPosts(
          postsData,
          finalTagsConfig
        );
        
        allTagsData = tagsData;
        tagMap = processedTagsMap;
        
        // 计算标签统计
        tagStats = calculateTagStats(allTagsData, postsData);
        
        console.log(`[Tags Plugin] 成功处理 ${allTagsData.length} 个标签，来自 ${postsData.length} 篇文章`);
        if (tagStats.hottest?.name) {
          console.log(`[Tags Plugin] 最热门标签: ${tagStats.hottest.name} (${tagStats.hottest.count} 篇文章)`);
        }
        
      } catch (error) {
        console.error('[Tags Plugin] 初始化失败:', error);
        // 不抛出错误，让构建继续，但标签功能将不可用
        allTagsData = [];
        tagMap = new Map();
        postsData = [];
        tagStats = {};
      }
    },
    
    addPages() {
      if (allTagsData.length === 0) {
        console.warn('[Tags Plugin] 没有标签数据，跳过页面生成');
        return [];
      }
      
      const pages = [];
      
      // 1. 生成标签索引页面 (/tags) - 使用 Markdown 格式
      const tagIndexMarkdown = `---
title: 标签云
description: 浏览所有文章标签，发现感兴趣的内容
---

# 标签云

浏览所有文章标签，发现感兴趣的内容

共 ${tagStats.totalTags || 0} 个标签${tagStats.hottest ? ` • 最热门: **${tagStats.hottest.name}** (${tagStats.hottest.count} 篇)` : ''}

## 热门标签

${allTagsData.slice(0, 20).map(tag => 
  `[${tag.name}](${tag.route}) (${tag.count}篇)`
).join(' • ')}

## 所有标签

${allTagsData.map(tag => `
### [#${tag.name}](${tag.route})

${tag.count} 篇文章

${tag.posts.slice(0, 3).map(post => 
  `- [${post.title}](${post.route})`
).join('\n')}

${tag.posts.length > 3 ? `*...还有 ${tag.posts.length - 3} 篇文章*` : ''}
`).join('\n')}
`;
      
      pages.push({
        routePath: finalTagsConfig.routePrefix,
        content: tagIndexMarkdown,
      });
      
      // 2. 为每个标签生成页面 - 使用 Markdown 格式
      for (const tag of allTagsData) {
        const relatedTags = getRelatedTags(tag.name, allTagsData, 5);
        
        const tagPageMarkdown = `---
title: "#${tag.name}"
description: ${tag.count} 篇相关文章
---

# #${tag.name}

[← 返回标签索引](/${finalTagsConfig.routePrefix})

${tag.count} 篇相关文章

## 文章列表

${tag.posts.map(post => `
### [${post.title}](${post.route})

<time style="color: #777; font-size: 0.875rem;">${new Date(post.createDate).toLocaleDateString('zh-CN')}</time>

${post.description || ''}

---
`).join('\n')}

${relatedTags.length > 0 ? `
## 相关标签

${relatedTags.map(rt => `[#${rt.name}](${rt.route}) (${rt.count}篇)`).join(' • ')}
` : ''}

## 标签信息

- **文章数量**: ${tag.count}
- **最新文章**: ${new Date(tag.posts[0]?.createDate).toLocaleDateString('zh-CN')}
${tag.posts.length > 1 ? `- **最早文章**: ${new Date(tag.posts[tag.posts.length - 1]?.createDate).toLocaleDateString('zh-CN')}` : ''}
`;
        
        pages.push({
          routePath: tag.route,
          content: tagPageMarkdown,
        });
      }
      
      console.log(`[Tags Plugin] 生成 ${pages.length} 个标签页面`);
      return pages;
    },
    
    addRuntimeModules() {
      // 创建虚拟模块暴露标签数据给主题组件
      return {
        'virtual-tags-data': `
          export const allTags = ${JSON.stringify(allTagsData)};
          export const tagMap = ${JSON.stringify(Object.fromEntries(tagMap))};
          export const tagsConfig = ${JSON.stringify(finalTagsConfig)};
          export const tagStats = ${JSON.stringify(tagStats)};
          
          export function getTagBySlug(slug) {
            return allTags.find(tag => tag.slug === slug);
          }
          
          export function getPostsByTag(tagName) {
            const tag = tagMap[tagName];
            return tag ? tag.posts : [];
          }
          
          export function getRelatedTags(currentTag, limit = 5) {
            const currentTagData = allTags.find(tag => tag.name === currentTag);
            if (!currentTagData) return [];
            
            const currentTagPosts = new Set(currentTagData.posts.map(p => p.route));
            
            return allTags
              .filter(tag => tag.name !== currentTag)
              .map(tag => ({
                ...tag,
                relevance: tag.posts.filter(post => currentTagPosts.has(post.route)).length
              }))
              .filter(tag => tag.relevance > 0)
              .sort((a, b) => b.relevance - a.relevance)
              .slice(0, limit)
              .map(({ relevance, ...tag }) => tag);
          }
        `,
      };
    },
  };
}
