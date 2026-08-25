# Lucid 主题架构说明

## 📁 目录结构

```
themes/lucid/src/
├── components/         # 主题组件
│   └── Footer.tsx      # 全局 Footer 组件
├── layouts/            # 页面布局
│   └── Home.tsx        # 首页布局
├── theme.css           # 主题样式
├── runtime-modules.ts  # 可选插件的空运行时模块桥接
└── index.ts            # 主题配置入口
```

## 🎯 核心架构原则

### ❌ 样式和组件不应该是"插件"

**错误认知**：将主题的样式和组件包装成插件
```typescript
// ❌ 错误：把主题核心能力包装成"插件"
const themeStylePlugin = { globalStyles: '...' };
const themeFooterPlugin = { globalUIComponents: ['...'] };

export function getThemeConfig() {
  return {
    plugins: [
      () => themeStylePlugin,  // 这不是插件！
      () => themeFooterPlugin, // 这也不是插件！
    ],
  };
}
```

**正确理解**：样式和组件是主题的**内置能力**，不是可选的功能插件

```typescript
// ✅ 正确：样式和组件是主题的一等公民
export function getThemeConfig() {
  return {
    // 主题内置能力（必需、不可禁用）
    globalStyles: path.resolve(__dirname, './theme.css'),
    globalUIComponents: [path.resolve(__dirname, './components/Footer.js')],
    
    // 功能插件（可选、可配置、可禁用）
    plugins: [
      pluginPostsFrontmatter,
      pluginRSS,
    ],
  };
}
```

## 📊 主题能力 vs 功能插件

| 特性 | 主题内置能力 | 功能插件 |
|------|-------------|---------|
| **定义** | 主题的核心组成部分 | 独立的业务功能模块 |
| **是否可选** | ❌ 必需 | ✅ 可选 |
| **是否可禁用** | ❌ 不可 | ✅ 可以 |
| **是否可替换** | ❌ 不可 | ✅ 可以 |
| **配置方式** | 直接在主题配置中声明 | 通过插件工厂函数 |
| **示例** | 样式文件、Footer、Header | Posts 处理、RSS、搜索 |

## 🏗️ CogitaTheme 接口设计

```typescript
export interface CogitaTheme {
  name: string;
  
  // ============================================
  // 主题内置能力（不是插件）
  // ============================================
  
  pageLayouts: {
    home: string;  // 首页布局组件路径
  };
  
  globalStyles?: string;  // 主题样式文件路径
  
  globalUIComponents?: (string | [string, object])[];  // 全局组件
  
  // ============================================
  // 功能插件（可选、可配置）
  // ============================================
  
  plugins?: CogitaPluginFactory[];
}
```

### 设计理由

1. **`globalStyles` 和 `globalUIComponents` 与 `plugins` 平级**
   - 清晰表达它们不是插件
   - 避免"假插件"的概念混淆

2. **由框架核心负责处理**
   - `@cogita/core` 的 `createThemePlugin()` 函数直接读取这些属性
   - 转换为 Rspress 的配置，无需用户干预

3. **主题作者只需声明**
   - 不需要创建插件文件
   - 不需要写插件逻辑
   - 只需要提供文件路径

## 🔧 工作流程

```
1. 主题声明能力
   themes/lucid/src/index.ts
   ↓
   export function getThemeConfig() {
     return {
       globalStyles: './theme.css',
       globalUIComponents: ['./components/Footer.js'],
       plugins: [pluginRSS, pluginPosts],
     };
   }

2. Core 框架处理
   packages/core/src/node/config.ts
   ↓
   function createThemePlugin(theme: CogitaTheme) {
     return {
       name: 'cogita-theme-plugin',
       globalStyles: theme.globalStyles,      // 直接传递
       globalUIComponents: theme.globalUIComponents,  // 直接传递
       addPages: () => { ... },  // 注册页面布局
     };
   }

3. Rspress 加载
   ↓
   自动加载样式、注册组件、渲染页面
```

## 🔌 可选插件与虚拟模块

主题布局在编译阶段会导入插件提供的虚拟模块。插件未配置时仍然必须保证这些导入可解析，否则“插件返回 null”会变成“主题无法构建”。Lucid 通过 `runtime-modules.ts` 注册空模块作为默认值，真实插件注册后会覆盖同名模块，因此同时满足：

- 插件未配置时优雅降级，最小站点可以构建；
- 插件启用时保留完整数据和页面能力；
- 主题组件不需要把插件配置验证逻辑写进渲染层。

这是一种主题侧的兼容桥接。未来如果多个主题都需要同样能力，可以将“虚拟模块契约与默认值”上提到 Core 的插件注册协议中。

## ✅ 架构优势

### 1. **概念清晰**
- 主题能力 ≠ 插件
- 避免"什么都是插件"的设计陷阱

### 2. **使用简单**
```typescript
// 主题作者只需要这样写：
export function getThemeConfig() {
  return {
    globalStyles: './theme.css',  // 声明即可
    globalUIComponents: ['./components/Footer.js'],
    plugins: [pluginRSS],  // 真正的插件
  };
}
```

### 3. **易于理解**
- 新用户看到配置就能理解：这是主题的样式和组件
- 不会困惑：为什么样式也要写成"插件"？

### 4. **符合直觉**
- 样式是主题的一部分，不是"插件"
- Footer 是主题的组成部分，不是"可选功能"

## 🎨 真正的插件是什么？

插件应该满足以下特征：

### ✅ 独立的业务功能
```typescript
// ✅ 这是真正的插件
export const pluginRSS: CogitaPluginFactory = (config) => {
  return {
    name: 'plugin-rss',
    config() { /* RSS 生成逻辑 */ },
    afterBuild() { /* 写入 RSS 文件 */ },
  };
};
```

### ✅ 可配置、可选、可禁用
```typescript
// 用户可以选择不使用
export function getThemeConfig() {
  return {
    plugins: [
      // pluginRSS,  // 可以注释掉不用
      pluginSearch,   // 可以按需添加
    ],
  };
}
```

### ✅ 跨主题复用
```typescript
// 不同主题都可以使用同一个插件
// @cogita/theme-lucid 可以用 pluginRSS
// @cogita/theme-minimal 也可以用 pluginRSS
```

## 📝 总结

| 类型 | 示例 | 配置方式 | 位置 |
|------|------|---------|------|
| **主题内置能力** | 样式、Footer、Header | `globalStyles`, `globalUIComponents` | 主题接口顶层 |
| **功能插件** | RSS、搜索、评论 | `plugins` 数组 | `plugins/` 目录 |

**核心原则**：
- ✅ 样式和组件是主题的**内置能力**
- ✅ 只有**业务功能**才应该封装为插件
- ✅ 不要让"插件"的概念泛化

这种架构确保了：
- ✅ 概念清晰，易于理解
- ✅ 使用简单，减少样板代码
- ✅ 职责分明，主题能力 ≠ 插件
- ✅ 符合直觉，降低学习成本
