# 🔌 插件开发文档

本目录包含Cogita插件系统的开发文档和设计规范，为插件开发者提供完整的技术指导。

## 📋 文档列表

### ✅ 开发指南

- **[插件开发指南](./plugin-development.md)** - 从零开发Cogita插件的完整教程
- **[Posts Frontmatter插件设计](./plugin-posts-frontmatter-design.md)** - 核心数据插件的架构设计
- **[RSS插件设计](./plugin-rss-design.md)** - RSS订阅插件的架构设计和实现方案

### 📝 计划中文档

- **[插件API规范](./plugin-api-specification.md)** *(计划中)* - 插件接口标准规范
- **[插件测试指南](./plugin-testing-guide.md)** *(计划中)* - 插件测试最佳实践
- **[官方插件目录](./official-plugins.md)** *(计划中)* - 官方插件列表和文档

## 🎯 按开发阶段导航

### 🚀 新手入门
1. [插件开发指南](./plugin-development.md) - 基础概念和快速开始
2. [Posts Frontmatter插件设计](./plugin-posts-frontmatter-design.md) - 学习现有插件架构
3. [API参考文档](../api/api-reference.md) - 查询具体API

### 🔧 插件设计
1. [RSS插件设计](./plugin-rss-design.md) - 学习完整的设计流程
2. [架构设计文档](../api/architecture-design.md) - 理解插件系统架构
3. [插件开发指南](./plugin-development.md) - 设计原则和最佳实践

### 🧪 开发实践
1. [插件开发指南](./plugin-development.md) - 实际开发步骤
2. [开发指南](../guides/development.md) - 开发环境和工作流
3. [最佳实践指南](../guides/best-practices.md) - 代码质量和性能优化

## 🔌 官方插件列表

### ✅ 已完成插件

| 插件名称 | 功能描述 | 状态 | 设计文档 |
|---------|----------|------|----------|
| `@cogita/plugin-posts-frontmatter` | 文章数据提取和路由生成 | ✅ 完成 | [设计文档](./plugin-posts-frontmatter-design.md) |
| `@cogita/plugin-rss` | RSS/Atom/JSON Feed 生成 | ✅ 完成 | [设计文档](./plugin-rss-design.md) |
| `@cogita/plugin-tags` | 标签管理与标签云 | ✅ 完成 | [README](../../plugins/tags/README.md) |
| `@cogita/plugin-collections` | 合集（系列文章）管理 | ✅ 完成 | [设计文档](./plugin-collections-design.md) |

### 📝 计划中插件

| 插件名称 | 功能描述 | 优先级 | 预计时间 |
|---------|----------|-------|---------|
| `@cogita/plugin-sitemap` | XML站点地图生成 | 🔥 高 | Q2 2025 |
| `@cogita/plugin-search` | 本地搜索功能 | 🔥 高 | Q2 2025 |
| `@cogita/plugin-comments` | 评论系统集成 | 🔸 中 | Q3 2025 |
| `@cogita/plugin-seo` | SEO优化工具 | 🔸 中 | Q3 2025 |

## 🏗️ 插件架构概览

```
Cogita 插件系统
├── 插件注册 (Plugin Registration)
├── 生命周期钩子 (Lifecycle Hooks)
│   ├── beforeBuild() - 构建前处理
│   ├── addPages() - 添加页面路由
│   ├── addRuntimeModules() - 添加虚拟模块
│   └── modifyHTML() - HTML内容修改
├── 数据流 (Data Flow)
│   ├── 文件系统扫描
│   ├── 数据处理和转换
│   └── 虚拟模块暴露
└── 集成机制 (Integration)
    ├── 主题自动加载
    ├── 插件间依赖
    └── 配置传递
```

## 📚 开发资源

### 🔧 技术栈
- **TypeScript** - 类型安全的JavaScript
- **Rspress** - 底层静态站点生成器
- **Node.js** - 服务端JavaScript运行时
- **Gray-matter** - Frontmatter解析库
- **Glob** - 文件模式匹配

### 📖 学习材料
- [Rspress插件开发指南](https://rspress.dev/guide/basic/extension/plugin-development)
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Node.js API文档](https://nodejs.org/docs/)

### 🛠️ 开发工具
- **VS Code** - 推荐的开发环境
- **Rslib** - 构建工具
- **Biome** - 代码格式化和Lint工具
- **Changesets** - 版本管理工具

## 📊 插件开发统计

### 当前状态
- **已发布插件**: 4个
- **开发中插件**: 0个  
- **计划中插件**: 10+个
- **社区插件**: 0个（期待你的贡献！）

### 开发活跃度
- **最近更新**: 2025年1月
- **活跃贡献者**: 1人
- **开放Issues**: [查看GitHub](https://github.com/wu9o/cogita/issues)

## 🤝 贡献插件

我们欢迎社区贡献插件！请参考：

1. [插件开发指南](./plugin-development.md) - 学习如何开发插件
2. [贡献指南](../../CONTRIBUTING.md) - 了解贡献流程  
3. [行为准则](../../CODE_OF_CONDUCT.md) - 社区行为规范

### 贡献步骤
1. Fork项目仓库
2. 创建插件分支
3. 按照开发指南实现插件
4. 编写测试和文档
5. 提交Pull Request

## 🔗 相关链接

- [返回文档中心](../README.md)
- [API参考文档](../api/)
- [使用指南](../guides/)
- [项目主页](../../README.md)

---

💡 **开始开发**: 如果你准备开发第一个插件，建议从阅读[插件开发指南](./plugin-development.md)开始，然后参考[Posts Frontmatter插件设计](./plugin-posts-frontmatter-design.md)了解实际的插件架构。
