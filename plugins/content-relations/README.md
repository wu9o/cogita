# @cogita/plugin-content-relations

从文章中的 Markdown 本地链接生成内容关系数据，为知识库主题提供相关文章、出链和反向链接。

## 使用

```bash
pnpm add @cogita/plugin-content-relations
```

```ts
import { defineConfig } from '@cogita/core';
import { pluginContentRelations } from '@cogita/plugin-content-relations';

export default defineConfig({
  posts: { dir: 'posts', routePrefix: 'posts' },
  contentRelations: { enabled: true },
  plugins: [pluginContentRelations],
});
```

插件只处理站内 Markdown 文本链接，例如：

```md
[阅读内容模型](./content-model.md)
[查看索引设计](/posts/content-index-design)
```

外部 URL、锚点、图片语法和 fenced code 中的链接会被忽略。没有解析到目标文章的链接也不会进入关系图，失效链接应由 `@cogita/plugin-content-check` 负责诊断。

## 运行时模块

启用后提供 `virtual-content-relations-data`：

```ts
import {
  getBacklinks,
  getRelatedContent,
} from 'virtual-content-relations-data';

const backlinks = getBacklinks('/posts/current');
const related = getRelatedContent('/posts/current');
```

插件只负责构建关系数据，不生成页面，也不绑定具体主题。知识库主题可以按自己的信息架构展示相关内容和反向链接。
