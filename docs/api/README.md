# 🔧 API 参考文档

本目录包含Cogita框架的API参考文档和架构设计文档，为开发者提供技术实现细节。

## 📋 文档列表

### ✅ 已完成文档

- **[API 参考文档](./api-reference.md)** - 完整的API接口和配置选项说明
- **[架构设计文档](./architecture-design.md)** - 系统架构和设计理念深度解析

### 📝 规划中文档

- **[核心API详解](./core-apis.md)** *(计划中)* - 核心包API详细说明
- **[主题API参考](./theme-apis.md)** *(计划中)* - 主题开发API接口
- **[插件API规范](./plugin-apis.md)** *(计划中)* - 插件开发API标准

## 🎯 按开发角色导航

### 🔌 插件开发者
1. [架构设计文档](./architecture-design.md) - 理解插件系统架构
2. [API 参考文档](./api-reference.md) - 插件API和钩子函数
3. [插件开发指南](../plugins/plugin-development.md) - 实际开发教程

### 🎨 主题开发者
1. [架构设计文档](./architecture-design.md) - 主题系统设计原理
2. [API 参考文档](./api-reference.md) - 主题配置和组件API
3. [主题开发指南](../theme-development.md) - 主题创建流程

### 🚀 核心贡献者
1. [架构设计文档](./architecture-design.md) - 深入系统设计
2. [API 参考文档](./api-reference.md) - 核心API设计
3. [开发指南](../guides/development.md) - 开发环境和规范

## 📚 API 快速索引

### 核心配置
- [CogitaConfig](./api-reference.md#cogitaconfig) - 主配置接口
- [SiteConfig](./api-reference.md#siteconfig) - 站点配置
- [ThemeConfig](./api-reference.md#themeconfig) - 主题配置

### 插件系统
- [CogitaPlugin](./api-reference.md#cogitaplugin) - 插件接口
- [PluginHooks](./api-reference.md#pluginhooks) - 插件钩子
- [VirtualModules](./api-reference.md#virtualmodules) - 虚拟模块

### 主题系统
- [CogitaTheme](./api-reference.md#cogitatheme) - 主题接口
- [ThemeLayouts](./api-reference.md#themelayouts) - 布局组件
- [ThemeComponents](./api-reference.md#themecomponents) - 主题组件

## 🔍 架构概览

```
Cogita 架构层次
├── 用户配置层 (CogitaConfig)
├── 核心抽象层 (@cogita/core)
├── 主题系统层 (Theme System)
├── 插件系统层 (Plugin System)
├── 构建工具层 (Rspress Integration)
└── 静态输出层 (Static Site)
```

详细架构设计请参考 [架构设计文档](./architecture-design.md)。

## 🔗 相关链接

- [返回文档中心](../README.md)
- [使用指南](../guides/)
- [插件开发文档](../plugins/)
- [项目主页](../../README.md)

## 📖 阅读建议

1. **初次了解**: 先阅读[架构设计文档](./architecture-design.md)理解整体设计
2. **API查询**: 使用[API参考文档](./api-reference.md)作为开发手册
3. **深入开发**: 结合[插件开发指南](../plugins/plugin-development.md)实践

---

💡 **提示**: 如果你是第一次接触Cogita开发，建议先阅读[快速开始指南](../getting-started.md)和[最佳实践指南](../guides/best-practices.md)。
