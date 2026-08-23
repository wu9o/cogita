# Editorial 主题架构

Editorial 遵循 Cogita 的主题驱动架构：

```text
功能插件生成虚拟数据
        ↓
Editorial 布局消费数据
        ↓
页面样式和全局组件完成内容呈现
```

主题自身不扫描文章、不生成搜索索引，也不实现 RSS、SEO 或评论服务。它通过 `plugins` 声明需要的功能插件，通过 `pageLayouts`、`globalStyles` 和 `globalUIComponents` 提供视觉层。

## 页面分工

- `Home`：品牌介绍、主推文章、最近更新和内容入口；
- `BlogList`：全部文章分页；
- `Archive`：按时间归档；
- `Search`：本地搜索结果；
- `Tag`：标签索引和标签详情；
- `Category`：层级分类索引和分类详情；
- `Collection`：合集索引和系列阅读顺序。

文章详情页继续使用 Rspress 的正文渲染，由主题全局样式、阅读进度、代码复制、评论和合集导航增强。
