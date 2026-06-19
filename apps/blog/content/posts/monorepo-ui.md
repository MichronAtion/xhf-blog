---
title: "在 Monorepo 里复用 UI"
date: "2026-05-10"
description: "从 packages/ui、chat-ui 到 transpilePackages：本站如何把通用组件抽成 workspace 包，让 apps 只写页面。"
category: "工程实践"
tag: "Architecture"
cover: "ocean"
featured: false
---

本站是一个 **pnpm workspace + Turborepo** 的 monorepo：博客、AI 助手、共享 UI 包放在同一仓库里，改一处组件，所有引用它的应用立刻生效。

> 小目标：每个 package 职责单一，**apps 只关注路由与业务**，样式与交互组件下沉到 `packages/`。

---

## 仓库长什么样

```
xhf-blob/
├── apps/
│   ├── blog/          # Next.js 博客（消费 UI 包）
│   └── assistant/     # Hono API（不依赖 React UI）
├── packages/
│   ├── ui/            # 通用布局：Container、Prose
│   ├── chat-ui/       # AI 对话：ChatPanel、ChatWidget
│   └── typescript-config/  # 共享 tsconfig
├── pnpm-workspace.yaml
└── turbo.json
```

`pnpm-workspace.yaml` 声明了 workspace 范围：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

任意 app 都可以通过 `workspace:*` 协议引用本地包，无需发布到 npm。

---

## 两个 UI 包各管什么

### `@repo/ui` — 与业务无关的「壳」

放**全站通用的布局与排版**，不绑定博客或 AI 的任何逻辑：

| 组件 | 作用 |
|------|------|
| `Container` | 居中限宽容器，`max-w-3xl` + 响应式 padding |
| `Prose` | 文章正文排版，基于 `@tailwindcss/typography`，含暗色模式与链接色 |

源码极简，两个组件都在 `packages/ui/src/index.tsx`：

```tsx
export function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Prose({ children, className = "" }) {
  return (
    <div className={`prose prose-zinc max-w-none dark:prose-invert ... ${className}`}>
      {children}
    </div>
  );
}
```

博客里这样用：

- `app/layout.tsx` — 页头、页脚包一层 `Container`
- `app/blog/[slug]/page.tsx` — 文章详情：`Container` + `Prose` 包裹 Markdown 渲染结果

### `@repo/chat-ui` — 可插拔的 AI 对话 UI

把**流式对话、会话持久化、引用展示**封装成独立包，博客只负责挂载位置和 API 地址：

| 导出 | 作用 |
|------|------|
| `ChatWidget` | 右下角悬浮按钮 + 弹层，适合全站嵌入 |
| `ChatPanel` | 完整对话面板，适合 `/chat` 全屏页 |
| `streamChat` / `loadSessionMessages` | 与 assistant 后端通信的客户端 API |

博客中的接入方式：

```tsx
// components/assistant-widget.tsx
import { ChatWidget } from "@repo/chat-ui";

<ChatWidget apiUrl={process.env.NEXT_PUBLIC_CHAT_API_URL} contextSlug={slug} />

// app/chat/page.tsx
import { ChatPanel } from "@repo/chat-ui";

<ChatPanel apiUrl={apiUrl} title="博客 AI 助手" />
```

UI 包**不知道**向量库、embedding 或 RAG 的实现细节，只通过 `apiUrl` 调 HTTP；后端逻辑留在 `apps/assistant`。

---

## 怎么把本地包「接」进 Next.js

### 1. 在 app 的 `package.json` 里声明依赖

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/chat-ui": "workspace:*"
  }
}
```

`workspace:*` 表示始终链接到 monorepo 内最新源码，开发时改 package 即热更新。

### 2. 配置 `exports` 指向源码

`packages/ui/package.json`：

```json
{
  "name": "@repo/ui",
  "exports": {
    ".": "./src/index.tsx",
    "./*": "./src/*"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

直接 export `.tsx` 源码，而不是先 build 成 `dist/`。对内部 UI 包来说，这样迭代最快；Next.js 会在 app 构建时一并编译。

### 3. 告诉 Next 要 transpile 这些包

外部 workspace 包默认不在 `node_modules` 的预编译路径里，需要在 `next.config.js` 显式声明：

```js
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/chat-ui"],
};
```

缺这一步，开发或构建时可能报「Unexpected token」或 JSX 无法解析。

### 4. 共享 TypeScript 配置

各 package 的 `tsconfig.json` 继承 `packages/typescript-config`；app 再 extend 同一套 base，保证 `strict`、模块解析等规则一致，IDE 跳转也能从 blog 一路点到 `packages/ui`。

---

## 职责怎么划分（经验法则）

| 层级 | 放什么 | 不放什么 |
|------|--------|----------|
| `packages/ui` | 布局、排版、无状态的展示组件 | 路由、`fetch`、环境变量 |
| `packages/chat-ui` | 对话 UI + 调用后端的 client 封装 | 向量检索、LLM 推理 |
| `apps/blog` | 页面、Markdown 内容、SEO、监控 SDK | 可复用的通用组件 |
| `apps/assistant` | API、数据库、ingest | React 组件 |

判断标准：**换一个 app（比如管理后台）还会不会用到这个组件？** 会 → 进 `packages/`；不会 → 留在 `apps/`。

---

## 新增一个共享包（ checklist ）

假设要抽一个 `@repo/icons`：

1. 在 `packages/icons/` 新建 `package.json`（`name`、`exports`、`peerDependencies`）
2. 写 `src/index.tsx`，导出组件
3. 在目标 app 的 `dependencies` 里加 `"@repo/icons": "workspace:*"`
4. 把包名加进 `next.config.js` 的 `transpilePackages`
5. 根目录执行 `pnpm install`，然后在 app 里 `import { ... } from "@repo/icons"`

Turborepo 的 `turbo.json` 已配置 `build` 的 `dependsOn: ["^build"]`：若将来 package 需要先 `tsc` 出 `dist`，上游 build 会自动排在 app build 之前。

---

## 本地开发时的体验

根目录一条命令同时跑所有 app：

```bash
pnpm dev   # turbo dev → blog + assistant 并行
```

改 `packages/ui/src/index.tsx` 里的 `Container` 宽度，保存后博客页面会热更新，**无需**先 `pnpm build` UI 包。

这也是 monorepo 复用 UI 相比「复制粘贴组件」或「发 npm 包再升级版本」最大的日常收益。

---

## 和「只放一个 Next 项目」比，值不值？

| 方式 | 优点 | 代价 |
|------|------|------|
| 单仓库单 app | 简单，零配置 | 组件难以跨项目复用，边界容易糊 |
| monorepo + packages | 源码级共享、类型安全、统一 lint/tsconfig | 要维护 workspace、transpilePackages |

本站目前只有两个 app，但 UI 已经拆成 `ui` + `chat-ui` 两层：**越通用的越往下沉**，以后加文档站、管理端时可以直接依赖同一套包。

---

## 小结

1. 通用 UI 放在 `packages/`，用 `workspace:*` 链接  
2. Next.js 项目记得配置 `transpilePackages`  
3. package 只 export 组件与 client API，业务与数据留在 app  
4. 本地改 package 源码即生效，适合高频迭代的 design system  

下一步如果 package 变多，可以考虑：给 `@repo/ui` 加 Storybook、用 Changesets 管理版本、或在 CI 里对 packages 单独跑 lint/test。当前规模下，**保持 package 小、导出清晰** 比过早上工具链更重要。
