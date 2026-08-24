---
title: 插件 API 规范
---

# 插件 API 规范

插件是接收最终配置并返回 Rspress 插件实例的工厂函数：

~~~ts
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginExample: CogitaPluginFactory = (config) => {
  if (config.example?.enabled === false) {
    return null;
  }

  return {
    name: '@cogita/plugin-example',
  };
};
~~~

如果插件会生成主题页面，可以声明主题布局契约：

~~~ts
return {
  name: '@cogita/plugin-example',
  cogita: {
    requiredLayouts: [{ layout: 'example', label: '示例页面' }],
  },
};
~~~

Core 只负责校验声明，不维护具体插件名称列表。这样第三方插件可以独立增加页面能力。
