# 插件开发指南

本指南将详细介绍如何为 Cogita 开发插件，包括插件架构、开发流程和最佳实践。

## 🔧 插件系统架构

### 核心概念

Cogita 的插件系统建立在 Rspress 插件系统之上，但提供了更高层次的抽象和约定。

#### 插件工厂函数 (Plugin Factory)

```typescript
export type CogitaPluginFactory = (
  config: Record<string, any>
) => RspressPlugin | RspressPlugin[] | null | undefined;
```

插件工厂函数接收完整的配置对象，返回一个或多个 Rspress 插件实例。这种设计允许：
- 基于配置动态创建插件
- 一个工厂函数返回多个相关插件
- 条件性地启用/禁用插件功能

#### Rspress 插件接口

```typescript
interface RspressPlugin {
  name: string;
  beforeBuild?: () => void | Promise<void>;
  afterBuild?: () => void | Promise<void>;
  addPages?: () => AdditionalPage[] | Promise<AdditionalPage[]>;
  addRuntimeModules?: () => Record<string, string>;
  // ... 更多生命周期钩子
}
```

## 📦 创建新插件

### 1. 项目结构

创建标准的插件项目结构：

```
packages/plugin-your-feature/
├── src/
│   ├── index.ts          # 插件入口，导出插件工厂
│   ├── plugin.ts         # 插件主要逻辑实现
│   ├── types.ts          # TypeScript 类型定义
│   └── utils.ts          # 工具函数
├── client.d.ts           # 客户端类型声明
├── package.json
├── tsconfig.json
├── rslib.config.ts       # 构建配置
└── README.md
```

### 2. package.json 配置

```json
{
  "name": "@cogita/plugin-your-feature",
  "version": "0.0.1",
  "description": "Your plugin description",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/es/index.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rslib build",
    "dev": "rslib build -w"
  },
  "dependencies": {
    "@rspress/core": "^1.45.1"
  }
}
```

### 3. 插件实现示例

#### 基础插件模板 (src/plugin.ts)

```typescript
import type { RspressPlugin } from '@rspress/core';
import type { YourPluginOptions } from './types';

export function yourFeaturePlugin(options: YourPluginOptions): RspressPlugin {
  return {
    name: '@cogita/plugin-your-feature',
    
    async beforeBuild() {
      console.log('Plugin: Preparing build...');
      // 在构建前执行的逻辑
      // 例如：数据预处理、文件准备等
    },

    async afterBuild() {
      console.log('Plugin: Build completed');
      // 在构建后执行的逻辑
      // 例如：生成额外文件、清理临时文件等
    },

    addPages() {
      // 动态添加页面
      return [
        {
          routePath: '/your-feature',
          content: '---npageType: customn---',
          filepath: '/path/to/your/component.tsx',
        }
      ];
    },

    addRuntimeModules() {
      // 添加虚拟模块，供前端代码使用
      return {
        'virtual-your-feature': `
          export const yourFeatureData = ${JSON.stringify(options.data)};
        `,
      };
    },
  };
}
```

#### 插件工厂函数 (src/index.ts)

```typescript
import type { CogitaPluginFactory } from '@cogita/shared';
import { yourFeaturePlugin } from './plugin';
import type { YourPluginOptions } from './types';

export const pluginYourFeature: CogitaPluginFactory = (config) => {
  // 从完整配置中提取插件所需的配置
  const pluginOptions: YourPluginOptions = {
    enabled: config.yourFeature?.enabled ?? true,
    data: config.yourFeature?.data ?? {},
    // 可以访问其他配置
    siteTitle: config.site?.title,
    postsDir: config.postsDir || 'posts',
  };

  // 条件性返回插件
  if (!pluginOptions.enabled) {
    return null;
  }

  return yourFeaturePlugin(pluginOptions);
};

// 导出类型供其他插件或主题使用
export * from './types';
```

#### 类型定义 (src/types.ts)

```typescript
export interface YourPluginOptions {
  enabled: boolean;
  data: Record<string, any>;
  siteTitle?: string;
  postsDir?: string;
}

export interface YourFeatureData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
```

## 🔄 插件生命周期

### 1. 配置阶段

- Cogita 加载用户配置
- 主题声明插件依赖
- 插件工厂函数被调用，传入完整配置

### 2. 构建阶段

```typescript
// 1. beforeBuild - 构建前准备
async beforeBuild() {
  // 数据收集和预处理
  // 文件系统操作
  // 外部 API 调用
}

// 2. addPages - 动态页面生成
addPages() {
  // 根据数据生成页面路由
  // 返回页面配置数组
}

// 3. addRuntimeModules - 运行时模块
addRuntimeModules() {
  // 创建虚拟模块
  // 数据注入到前端
}

// 4. afterBuild - 构建后处理
async afterBuild() {
  // 生成额外文件
  // 清理和优化
}
```

## 📖 实际案例分析：posts-frontmatter 插件

让我们分析现有的 `posts-frontmatter` 插件实现：

### 功能概述

该插件负责：
1. 扫描 `posts` 目录下的 Markdown 文件
2. 提取每个文件的 frontmatter 元数据
3. 生成文章路由页面
4. 通过虚拟模块向前端提供文章数据

### 关键实现

```typescript
export function pluginPostsFrontmatter(config: Record<string, any>): RspressPlugin {
  const postsDir = config.postsDir || 'posts';
  const routePrefix = config.routePrefix || 'posts';
  let allPostsData: PostFrontmatter[] = [];

  return {
    name: '@cogita/plugin-posts-frontmatter',

    async beforeBuild() {
      // 1. 使用 glob 扫描 Markdown 文件
      const absolutePaths = await glob(`${postsDir}/**/*.{md,mdx}`, {
        absolute: true,
        cwd: config.cwd,
        nodir: true,
      });

      // 2. 提取并处理 frontmatter
      allPostsData = absolutePaths
        .map((file) => getFrontmatterFromFile(file, postsDir, routePrefix))
        .filter(Boolean) as PostFrontmatter[];

      // 3. 按日期排序
      allPostsData.sort(
        (a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
      );
    },

    addPages() {
      // 为每篇文章创建路由页面
      return allPostsData.map((post) => ({
        routePath: post.route,
        content: '---npageType: homen---',
        filepath: post.filePath,
      }));
    },

    addRuntimeModules() {
      // 创建虚拟模块供前端访问
      return {
        'virtual-posts-data': `export const allPosts = ${JSON.stringify(allPostsData)};`,
      };
    },
  };
}
```

### 核心工具函数

```typescript
export function getFrontmatterFromFile(
  filePath: string,
  postsDir: string,
  routePrefix = 'posts'
): PostFrontmatter | null {
  try {
    // 1. 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    
    // 2. 解析 frontmatter
    const { data: frontmatter } = matter(fileContent);
    
    // 3. 生成路由路径
    const relativePath = path.relative(postsDir, filePath);
    const routeWithoutExt = relativePath.replace(/\.(mdx?)$/, '');
    const route = `/${path.join(routePrefix, routeWithoutExt)}`.replace(/\\/g, '/');

    // 4. 组装数据
    return {
      title: frontmatter.title || path.basename(filePath, fileExt),
      description: frontmatter.description,
      filePath,
      route,
      createDate: frontmatter.date || stats.birthtime.toISOString(),
      updateDate: frontmatter.updateDate || stats.mtime.toISOString(),
      // ... 其他元数据
    };
  } catch (e) {
    console.error(`从 ${filePath} 读取 frontmatter 时出错:`, e);
    return null;
  }
}
```

## 🎨 高级插件开发模式

### 1. 多插件组合

一个插件工厂可以返回多个相关的插件：

```typescript
export const pluginBlogSystem: CogitaPluginFactory = (config) => {
  const plugins: RspressPlugin[] = [];
  
  // 基础文章插件
  plugins.push(pluginPosts(config));
  
  // 条件性添加标签插件
  if (config.blog?.enableTags) {
    plugins.push(pluginTags(config));
  }
  
  // 条件性添加RSS插件
  if (config.blog?.enableRss) {
    plugins.push(pluginRss(config));
  }
  
  return plugins;
};
```

### 2. 配置验证和默认值

```typescript
import Joi from 'joi';

const configSchema = Joi.object({
  enabled: Joi.boolean().default(true),
  postsDir: Joi.string().default('posts'),
  routePrefix: Joi.string().default('posts'),
  sortBy: Joi.string().valid('date', 'title').default('date'),
});

export const pluginPosts: CogitaPluginFactory = (config) => {
  // 验证和标准化配置
  const { error, value: validatedConfig } = configSchema.validate(config.posts || {});
  
  if (error) {
    throw new Error(`Posts plugin configuration error: ${error.message}`);
  }
  
  return pluginPostsCore(validatedConfig);
};
```

### 3. 虚拟模块的高级用法

```typescript
addRuntimeModules() {
  return {
    'virtual-posts-data': `
      export const allPosts = ${JSON.stringify(allPostsData)};
      export const postsByTag = ${JSON.stringify(postsByTag)};
      export const recentPosts = ${JSON.stringify(recentPosts)};
      
      // 提供辅助函数
      export function getPostBySlug(slug) {
        return allPosts.find(post => post.slug === slug);
      }
      
      export function getPostsByTag(tag) {
        return postsByTag[tag] || [];
      }
    `,
    
    'virtual-blog-config': `
      export const blogConfig = ${JSON.stringify({
        postsPerPage: config.blog?.postsPerPage || 10,
        showExcerpts: config.blog?.showExcerpts ?? true,
      })};
    `,
  };
}
```

## 🧪 插件测试

### 1. 单元测试示例

```typescript
// __tests__/plugin.test.ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { pluginPostsFrontmatter } from '../src/plugin';

describe('posts-frontmatter plugin', () => {
  const testDir = path.join(__dirname, 'fixtures');
  
  beforeEach(async () => {
    await fs.ensureDir(path.join(testDir, 'posts'));
    await fs.writeFile(
      path.join(testDir, 'posts', 'test-post.md'),
      `---
title: "Test Post"
date: "2024-01-01"
tags: ["test"]
---
# Test Content
`
    );
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
  it('should extract frontmatter correctly', async () => {
    const plugin = pluginPostsFrontmatter({
      cwd: testDir,
      postsDir: 'posts',
    });
    
    await plugin.beforeBuild?.();
    const pages = plugin.addPages?.() || [];
    
    expect(pages).toHaveLength(1);
    expect(pages[0].routePath).toBe('/posts/test-post');
  });
});
```

### 2. 集成测试

```typescript
// __tests__/integration.test.ts
import { createRspressConfig } from '@cogita/core';

describe('plugin integration', () => {
  it('should integrate with cogita core', async () => {
    const config = await createRspressConfig(
      {
        site: { title: 'Test Site' },
        theme: 'lucid',
      },
      testDir
    );
    
    expect(config.plugins).toBeDefined();
    expect(config.plugins?.some(p => p.name === '@cogita/plugin-posts-frontmatter')).toBe(true);
  });
});
```

## 📚 最佳实践

### 1. 配置设计

- **提供合理默认值**：插件应该在最小配置下工作
- **配置验证**：使用 schema 验证用户配置
- **向后兼容**：小心处理配置变更

### 2. 错误处理

```typescript
async beforeBuild() {
  try {
    await this.processFiles();
  } catch (error) {
    console.error(`Plugin ${this.name} error:`, error.message);
    // 提供有用的错误信息和解决建议
    if (error.code === 'ENOENT') {
      console.error('提示：请检查 postsDir 配置是否正确');
    }
    throw error;
  }
}
```

### 3. 性能优化

- **缓存计算结果**：避免重复计算
- **异步处理**：使用 Promise.all 并行处理
- **最小化文件操作**：批量读取，减少 I/O

### 4. 可扩展性

- **提供钩子函数**：让用户能够自定义行为
- **模块化设计**：将功能拆分为独立模块
- **事件系统**：允许插件间通信

## 🔗 与主题集成

插件通常通过主题的 `plugins` 数组被自动加载：

```typescript
// themes/your-theme/src/index.ts
export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-your-theme',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    plugins: [
      pluginPostsFrontmatter,  // 自动加载
      pluginYourFeature,       // 自定义插件
    ],
  };
}
```

## 📋 插件发布清单

发布前检查：

- [ ] 完整的 TypeScript 类型定义
- [ ] 全面的单元测试和集成测试
- [ ] 详细的 README 文档
- [ ] 合理的版本语义化
- [ ] 依赖项优化（避免不必要的依赖）
- [ ] 构建产物正确（ESM 格式）
- [ ] 客户端类型声明（如有虚拟模块）

## 🤝 社区贡献

我们欢迎社区贡献插件！请参考：

1. 提交 RFC 讨论插件设计
2. 遵循代码规范和测试要求
3. 提供完整的文档和示例
4. 考虑与现有插件的兼容性

---

通过本指南，你应该能够开发功能完整、质量优秀的 Cogita 插件。如果有任何问题，欢迎在 GitHub 讨论区交流！
