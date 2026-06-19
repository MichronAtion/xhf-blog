"use client";

import { useEffect, useRef, useState } from "react";
import {
  createMessage,
  getStoredSessionId,
  loadSessionMessages,
  streamChat,
  type ChatMessage,
} from "./chat-api";
import { MessageList } from "./message-list";

export type ChatPanelProps = {
  apiUrl: string;
  contextSlug?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
};

export function ChatPanel({
  apiUrl,
  contextSlug,
  title = "问 AI",
  subtitle,
  className = "",
  compact = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!apiUrl) {
        setLoadingHistory(false);
        return;
      }

      const storedSessionId = getStoredSessionId();
      if (!storedSessionId) {
        setLoadingHistory(false);
        return;
      }

      try {
        const history = await loadSessionMessages(apiUrl, storedSessionId);
        if (cancelled) return;
        setSessionId(storedSessionId);
        setMessages(
          history.map((message) =>
            createMessage(message.role, message.content, message.citations),
          ),
        );
      } catch {
        if (!cancelled) {
          setSessionId(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setInput("");

    const userMessage = createMessage("user", text);
    const assistantMessage = createMessage("assistant", "");
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, assistantMessage]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        apiUrl,
        contextSlug,
        sessionId: sessionId ?? undefined,
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        signal: controller.signal,
        onSessionId: setSessionId,
        onDelta: (delta) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: message.content + delta }
                : message,
            ),
          );
        },
        onCitations: (citations) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, citations }
                : message,
            ),
          );
        },
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "发送失败，请稍后重试";
      setError(message);
      setMessages((current) =>
        current.filter((message) => message.id !== assistantMessage.id),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "h-full" : "h-[min(70vh,640px)]"} ${className}`}
    >
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        ) : null}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            加载历史消息…
          </div>
        ) : (
          <MessageList messages={messages} streaming={streaming} />
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 p-3 dark:border-zinc-800"
      >
        {error ? (
          <p className="mb-2 text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit(event);
              }
            }}
            rows={compact ? 2 : 3}
            placeholder="输入问题，Enter 发送，Shift+Enter 换行"
            disabled={streaming || loadingHistory}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={streaming || loadingHistory || !input.trim()}
            className="self-end rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
