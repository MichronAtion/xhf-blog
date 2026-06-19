"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "./chat-panel";

export type ChatWidgetProps = {
  apiUrl: string;
  contextSlug?: string;
  chatPageHref?: string;
};

export function ChatWidget({
  apiUrl,
  contextSlug,
  chatPageHref = "/chat",
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const subtitle = contextSlug
    ? `当前文章上下文：${contextSlug}`
    : "基于博客文章内容回答";

  return (
    <>
      <button
        type="button"
        aria-label="打开 AI 对话"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-emerald-500/30"
      >
        AI
      </button>

      {open ? (
        <div className="rr-block fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center sm:p-6">
          <button
            type="button"
            aria-label="关闭对话"
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex h-[min(82vh,720px)] w-full max-w-lg flex-col">
            <div className="mb-2 flex items-center justify-end gap-2 px-1">
              <a
                href={
                  contextSlug
                    ? `${chatPageHref}?context=${encodeURIComponent(contextSlug)}`
                    : chatPageHref
                }
                className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur hover:text-emerald-600 dark:bg-zinc-900/90 dark:text-zinc-300"
              >
                全屏对话
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur hover:text-zinc-900 dark:bg-zinc-900/90 dark:text-zinc-300"
              >
                关闭
              </button>
            </div>
            <ChatPanel
              apiUrl={apiUrl}
              contextSlug={contextSlug}
              subtitle={subtitle}
              compact
              className="h-full shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
