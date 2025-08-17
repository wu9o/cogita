---
title: Understanding Markdown Syntax
date: 2025-08-17
tags: [Markdown, Guide, Writing]
excerpt: A quick guide to the most common Markdown syntax you'll need for writing your blog posts.
---

Markdown is a lightweight markup language with plain-text-formatting syntax. Its design allows it to be converted to many output formats, but the original tool by the same name only supports HTML.

### Headings

```markdown
# H1
## H2
### H3
```

### Lists

-   Unordered Item 1
-   Unordered Item 2
    -   Nested Item

1.  Ordered Item 1
2.  Ordered Item 2

### Code Blocks

You can create inline code like `const a = 1;`.

Or fenced code blocks for larger snippets:

```javascript
import { defineConfig } from 'cogita';

export default defineConfig({
  title: 'My Awesome Blog',
});
```

### Blockquotes

> To be, or not to be, that is the question.

This is just a small sample of what Markdown can do. For more details, check out the [official documentation](https://daringfireball.net/projects/markdown/).
