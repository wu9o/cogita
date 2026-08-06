# @cogita/plugin-collections

## 0.1.0

### Minor Changes

- da453e3: feat(collections): 完成合集插件核心功能与文章页合集导航

  合集插件（@cogita/plugin-collections）实现完整功能：

  - 有序系列文章管理（frontmatter collection + order 字段）
  - 自动生成合集索引页和详情页路由
  - 虚拟模块 virtual-collections-data 暴露合集数据和辅助函数
  - 合集元数据覆盖（config.metadata 按 slug 索引）
  - 最小文章数阈值过滤（minPostCount）

  主题 lucid 集成：

  - 新增 Collection.tsx 布局（索引页卡片 + 详情页有序列表双模式）
  - 新增 CollectionNav.tsx 全局组件（文章页合集归属 + 上下篇导航）
  - 首页侧边栏展示合集列表
  - 完整 CSS 样式含响应式和暗色模式支持

  核心框架修复：

  - 修复 createThemePlugin 未传递 globalUIComponents 的 bug
  - 修复 globalStyles 路径截断 bug（?.[0] 取字符串首字符改为直接传递）
  - 新增 CLI preview 命令实现（之前为 TODO）
