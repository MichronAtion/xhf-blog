"use client";

import type { ChatMessage } from "./chat-api";

type MessageListProps = {
  messages: ChatMessage[];
  streaming?: boolean;
};

export function MessageList({ messages, streaming }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-zinc-500">
        <p>问我任何与博客相关的问题</p>
        <p className="mt-1 text-xs">我会检索向量库中的文章片段来回答</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%]">
              <div
                className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {message.content}
              </div>
              {!isUser && message.citations && message.citations.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-medium text-zinc-500">参考文章</p>
                  {message.citations.map((citation) => (
                    <a
                      key={`${message.id}-${citation.slug}`}
                      href={`/blog/${citation.slug}`}
                      className="block rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                    >
                      <span className="font-medium">{citation.title}</span>
                      <span className="ml-2 text-[10px] text-zinc-400">
                        相似度 {(citation.similarity * 100).toFixed(0)}%
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                        {citation.excerpt}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {streaming ? (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-zinc-100 px-3.5 py-2.5 text-xs text-zinc-500 dark:bg-zinc-800">
            正在输入…
          </div>
        </div>
      ) : null}
    </div>
  );
}
