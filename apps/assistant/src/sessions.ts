import { getPool } from "./db/client.js";
import type { Citation } from "./types.js";

export type StoredMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[] | null;
  createdAt: string;
};

export async function createSession(): Promise<string> {
  const db = getPool();
  const result = await db.query<{ id: string }>(
    "INSERT INTO sessions DEFAULT VALUES RETURNING id",
  );
  const sessionId = result.rows[0]?.id;
  if (!sessionId) {
    throw new Error("创建会话失败");
  }
  return sessionId;
}

export async function sessionExists(sessionId: string): Promise<boolean> {
  const db = getPool();
  const result = await db.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM sessions WHERE id = $1::uuid) AS exists",
    [sessionId],
  );
  return Boolean(result.rows[0]?.exists);
}

export async function getSessionMessages(sessionId: string): Promise<StoredMessage[]> {
  const db = getPool();
  const result = await db.query<{
    role: "user" | "assistant" | "system";
    content: string;
    citations: Citation[] | null;
    created_at: Date;
  }>(
    `
    SELECT role, content, citations, created_at
    FROM messages
    WHERE session_id = $1::uuid
    ORDER BY created_at ASC, id ASC
    `,
    [sessionId],
  );

  return result.rows.map((row) => ({
    role: row.role,
    content: row.content,
    citations: row.citations,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant" | "system",
  content: string,
  citations?: Citation[],
): Promise<void> {
  const db = getPool();
  await db.query(
    `
    INSERT INTO messages (session_id, role, content, citations)
    VALUES ($1::uuid, $2, $3, $4::jsonb)
    `,
    [sessionId, role, content, citations ? JSON.stringify(citations) : null],
  );
}

export async function ensureSession(sessionId?: string): Promise<string> {
  if (sessionId && (await sessionExists(sessionId))) {
    return sessionId;
  }
  return createSession();
}
