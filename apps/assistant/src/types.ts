export type Citation = {
  slug: string;
  title: string;
  excerpt: string;
  similarity: number;
};

export type RetrievedChunk = {
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  content: string;
  chunkIndex: number;
  similarity: number;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type StreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "delta"; delta: string; error?: boolean }
  | { type: "citations"; items: Citation[] };
