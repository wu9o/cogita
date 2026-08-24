# @cogita/plugin-tags

## 1.0.2

### Patch Changes

- cd14acc: 增加文章列表的标签与分类筛选页，统一 SEO 和 Sitemap 的文章列表路由契约，收口插件配置类型，并让各内容插件复用 core 内容索引和正文缓存。
  - @cogita/plugin-posts-frontmatter@0.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [91ba0ee]
  - @cogita/plugin-posts-frontmatter@0.1.1

## 1.0.0

### Patch Changes

- Updated dependencies [6c06862]
  - @cogita/plugin-posts-frontmatter@0.1.0

## 0.1.1

### Patch Changes

- Updated dependencies [5d28fcd]
  - @cogita/plugin-posts-frontmatter@0.0.3

## 0.1.0

### Minor Changes

- bd78c85: 新增标签插件完整实现与主题 React 布局方案。

  ## 新功能

  - **@cogita/plugin-tags**：完整的标签管理插件

    - 自动从文章 frontmatter 提取标签，支持中英文
    - 生成标签索引页（/tags）和标签详情页（/tags/:slug）
    - 通过 `virtual-tags-data` 虚拟模块暴露标签数据（allTags、tagMap、getRelatedTags 等）
    - 标签页面使用主题 React 组件布局渲染（而非 Markdown 内容）

  - **@cogita/theme-lucid**：新增标签页布局与首页侧边栏
    - 新增 `TagPageLayout`（layouts/Tag.tsx），消费虚拟模块渲染标签索引页和详情页
    - 首页改为双栏布局：左侧标签云（TagCloud）+ 合集占位，右侧文章列表
    - 标签云点击跳转对应标签详情页

  ## 修复与改进

  - **@cogita/core**：

    - `createRspressConfig` 注入 `themeLayouts`，让 tags 等插件能用主题布局作为 `addPages` 的 filepath
    - `createThemePlugin` 传递 `globalStyles` 给 Rspress，修复 theme.css 从未加载的问题
    - 修正首页 frontmatter 为合法 YAML

  - **@cogita/shared**：

    - `CogitaPluginConfig` 增加 `themeLayouts` 字段
    - `CogitaTheme.pageLayouts` 增加 `tag` / `tagIndex` 可选字段

  - **@cogita/ui**：
    - `TagList` 改用本地 `generateTagSlug`（带兜底），避免 rspress 浏览器端无法 resolve `@cogita/shared`
    - `TagCloud` / `PostList` 样式优化

  ## Breaking Changes

  无。标签插件为新增功能，原有配置不受影响。

### Patch Changes

- @cogita/plugin-posts-frontmatter@0.0.2
