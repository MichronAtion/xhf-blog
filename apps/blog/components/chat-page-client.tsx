"use client";

import { ChatPanel } from "@repo/chat-ui";
import { usePathname, useSearchParams } from "next/navigation";

export function ChatPageClient() {
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slugMatch = pathname.match(/^\/blog\/([^/]+)$/);
  const contextSlug = slugMatch?.[1] ?? searchParams.get("context") ?? undefined;

  if (!apiUrl) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        请在 <code className="font-mono text-xs">apps/blog/.env</code> 中配置{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_CHAT_API_URL</code>（例如
        http://localhost:4001），并确保 assistant 服务已启动。
      </div>
    );
  }

  return (
    <ChatPanel
      apiUrl={apiUrl}
      contextSlug={contextSlug}
      title="博客 AI 助手"
      subtitle="基于站内文章回答，支持流式输出"
    />
  );
}
