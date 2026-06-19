import type { ChatMessage } from "./types.js";

type StreamOptions = {
  messages: ChatMessage[];
  ragContext: string;
  onDelta: (text: string) => void;
};

function buildSystemPrompt(ragContext: string): string {
  return [
    "你是博客作者的 AI 助手，基于提供的博客文章内容回答读者问题。",
    "规则：",
    "1. 优先使用「参考资料」中的信息；资料不足时说明不确定，不要编造文章细节。",
    "2. 回答简洁清晰，使用中文。",
    "3. 若问题与博客无关，可以简短回答并引导用户提问与博客相关的内容。",
    "",
    "参考资料：",
    ragContext,
  ].join("\n");
}

export async function streamChatCompletion(options: StreamOptions): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const fallback =
      "尚未配置 OPENAI_API_KEY。请在 apps/assistant/.env 中设置后重启 assistant 服务。";
    options.onDelta(fallback);
    return;
  }

  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: buildSystemPrompt(options.ragContext) },
        ...options.messages.filter((m) => m.role !== "system"),
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM 请求失败 (${response.status}): ${detail}`);
  }

  if (!response.body) {
    throw new Error("LLM 响应体为空");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) options.onDelta(delta);
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
