import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@repo/ui";
import { ChatPageClient } from "@/components/chat-page-client";

export const metadata: Metadata = {
  title: "AI 对话",
  description: "基于博客文章内容的 AI 助手",
};

export default function ChatPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">AI 对话</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            向我提问与博客相关的内容，我会检索文章并给出回答。
          </p>
        </header>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-zinc-200 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-800">
              加载对话界面…
            </div>
          }
        >
          <ChatPageClient />
        </Suspense>
      </Container>
    </div>
  );
}
