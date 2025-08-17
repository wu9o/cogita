# @cogita/ui

该包为 Cogita 生态系统提供了一套可主题化的共享 React 组件。

## 设计哲学

该组件库中的组件被设计为“半无头”(semi-headless)模式。它们提供基础的结构和功能，但其视觉外观主要由 CSS 自定义属性 (CSS 变量) 控制，这些变量期望由 Cogita 主题来提供。

这种设计允许在不同主题之间实现最大的灵活性和可复用性。

## 组件

-   `Button`: 一个简单的按钮组件。
-   `PostList`: 用于渲染博客文章列表的组件，支持自定义列表项渲染。

## 样式化

组件样式使用 CSS Modules 定义，并通过 CSS 变量进行主题化。主题可以通过在自己的样式表中定义这些变量，轻松地定制组件的外观。

### CSS 变量示例

```css
:root {
  --cogita-primary-color: #007acc;
  --cogita-primary-text-color: white;
  --cogita-border-color: #e5e7eb;
  --cogita-title-color: #111827;
}
```

## 使用

将此包与一个 Cogita 主题一起安装：

```bash
pnpm add @cogita/ui @cogita/theme-lucid
```

然后，在您的主题或自定义布局中使用这些组件。

```tsx
import { Button } from '@cogita/ui';

const MyComponent = () => <Button>Click Me</Button>;
```
