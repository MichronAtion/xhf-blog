---
title: "在 Monorepo 里复用 UI"
date: "2026-05-10"
description: "演示 packages/ui 中的 Container 与 Prose 如何被博客应用引用。"
category: "工程实践"
tag: "Architecture"
cover: "ocean"
---

本站把通用布局组件放在 `packages/ui`，博客应用通过 `transpilePackages` 直接引用源码，本地开发时改一处即可同步。

> 小目标：保持每个 package 职责单一，apps 只关注页面与内容。

## 下一步可以怎么做

1. 接入 CMS 或 GitHub Issues 作为内容源  
2. 加上 RSS、`sitemap.xml`、Open Graph 图  
3. 用 `next/font` 与配色做一套自己的品牌风格  

祝你写得开心。
