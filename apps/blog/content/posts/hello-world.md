---
title: "你好，世界"
date: "2026-05-01"
description: "第一篇示例文章，介绍本站技术栈与写作方式。"
category: "工程实践"
tag: "Dev"
cover: "aurora"
---

这是一篇示例文章。正文支持 **Markdown**，包括列表与链接：

- Monorepo：`pnpm` workspace + `Turborepo`
- 框架：Next.js 14（App Router）+ **React 18**
- 样式：Tailwind CSS + `@tailwindcss/typography`

```ts
// 类型安全的文章模型在 lib/posts.ts
export type Post = PostMeta & { slug: string; content: string };
```

更多内容只要把新的 `.md` 文件放进 `apps/blog/content/posts/` 即可。

在 frontmatter 里可使用 `category`、`tag` 与 `cover`（渐变预设 `violet` / `ocean` / …，或 `/images/...` 图片路径）。
