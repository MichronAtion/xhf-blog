export type ChatRole = "user" | "assistant";

export type Citation = {
  slug: string;
  title: string;
  excerpt: string;
  similarity: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  citations?: Citation[];
};

export type ChatRequest = {
  messages: Array<{ role: ChatRole; content: string }>;
  contextSlug?: string;
  sessionId?: string;
};

export type StreamChatOptions = {
  apiUrl: string;
  messages: ChatRequest["messages"];
  contextSlug?: string;
  sessionId?: string;
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
  onSessionId?: (sessionId: string) => void;
  onCitations?: (citations: Citation[]) => void;
};

type StreamPayload =
  | { type: "session"; sessionId: string }
  | { type: "delta"; delta: string; error?: boolean }
  | { type: "citations"; items: Citation[] }
  | { delta?: string; error?: boolean };

const SESSION_STORAGE_KEY = "blog-chat-session-id";

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function storeSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export async function createSession(apiUrl: string): Promise<string> {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/sessions`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("创建会话失败");
  }
  const json = (await response.json()) as { sessionId?: string };
  if (!json.sessionId) {
    throw new Error("创建会话失败");
  }
  storeSessionId(json.sessionId);
  return json.sessionId;
}

export async function loadSessionMessages(
  apiUrl: string,
  sessionId: string,
): Promise<Array<{ role: ChatRole; content: string; citations?: Citation[] }>> {
  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/sessions/${sessionId}/messages`,
  );
  if (!response.ok) {
    throw new Error("加载历史消息失败");
  }
  const json = (await response.json()) as {
    messages?: Array<{
      role: ChatRole;
      content: string;
      citations?: Citation[] | null;
    }>;
  };

  return (json.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: message.content,
      citations: message.citations ?? undefined,
    }));
}

export async function streamChat({
  apiUrl,
  messages,
  contextSlug,
  sessionId,
  signal,
  onDelta,
  onSessionId,
  onCitations,
}: StreamChatOptions): Promise<void> {
  const endpoint = `${apiUrl.replace(/\/$/, "")}/api/chat`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, contextSlug, sessionId }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `请求失败 (${response.status})`);
  }

  if (!response.body) {
    throw new Error("响应体为空");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;

        try {
          const json = JSON.parse(payload) as StreamPayload;
          if ("type" in json) {
            if (json.type === "session") {
              onSessionId?.(json.sessionId);
              storeSessionId(json.sessionId);
            } else if (json.type === "delta" && json.delta) {
              onDelta(json.delta);
            } else if (json.type === "citations") {
              onCitations?.(json.items);
            }
            continue;
          }
          if (json.delta) onDelta(json.delta);
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }
}

export function createMessage(
  role: ChatRole,
  content: string,
  citations?: Citation[],
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    citations,
  };
}
