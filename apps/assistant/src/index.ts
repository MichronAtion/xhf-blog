import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { closeDb, getDbStats, initDb } from "./db/client.js";
import { streamChatCompletion } from "./llm.js";
import { retrieveVectorContext } from "./rag-vector.js";
import {
  createSession,
  ensureSession,
  getSessionMessages,
  saveMessage,
} from "./sessions.js";
import type { ChatMessage } from "./types.js";

const app = new Hono();

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:4000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  "/*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

await initDb();

app.get("/health", async (c) => {
  const stats = await getDbStats();
  return c.json({
    ok: true,
    mode: "vector",
    ...stats,
  });
});

app.post("/api/sessions", async (c) => {
  const sessionId = await createSession();
  return c.json({ sessionId });
});

app.get("/api/sessions/:sessionId/messages", async (c) => {
  const sessionId = c.req.param("sessionId");
  const messages = await getSessionMessages(sessionId);
  return c.json({ messages });
});

app.post("/api/chat", async (c) => {
  let body: {
    messages?: ChatMessage[];
    contextSlug?: string;
    sessionId?: string;
  };

  try {
    body = (await c.req.json()) as {
      messages?: ChatMessage[];
      contextSlug?: string;
      sessionId?: string;
    };
  } catch {
    return c.json({ error: "请求体必须是合法 JSON" }, 400);
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const query = lastUser?.content?.trim() ?? "";

  if (!query) {
    return c.json({ error: "缺少用户消息" }, 400);
  }

  const sessionId = await ensureSession(body.sessionId);
  const { context, citations } = await retrieveVectorContext(query, body.contextSlug);

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ type: "session", sessionId }),
    });

    let assistantContent = "";

    try {
      await streamChatCompletion({
        messages,
        ragContext: context,
        onDelta: async (delta) => {
          assistantContent += delta;
          await stream.writeSSE({
            data: JSON.stringify({ type: "delta", delta }),
          });
        },
      });

      await stream.writeSSE({
        data: JSON.stringify({ type: "citations", items: citations }),
      });

      await saveMessage(sessionId, "user", query);
      await saveMessage(sessionId, "assistant", assistantContent, citations);
      await stream.writeSSE({ data: "[DONE]" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "对话服务暂时不可用";
      assistantContent = message;
      await stream.writeSSE({
        data: JSON.stringify({ type: "delta", delta: message, error: true }),
      });
      await saveMessage(sessionId, "user", query);
      await saveMessage(sessionId, "assistant", assistantContent);
      await stream.writeSSE({ data: "[DONE]" });
    }
  });
});

const port = Number(process.env.PORT ?? 4001);

const server = serve({ fetch: app.fetch, port }, async () => {
  const stats = await getDbStats();
  console.log(`assistant listening on http://localhost:${port}`);
  console.log(`vector store: ${stats.posts} posts, ${stats.chunks} chunks`);
});

async function shutdown() {
  await closeDb();
  server.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
