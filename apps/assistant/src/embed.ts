function getEmbeddingConfig() {
  const apiKey = process.env.EMBEDDING_API_KEY ?? process.env.OPENAI_API_KEY ?? "local";
  const baseUrl = (
    process.env.EMBEDDING_BASE_URL ??
    process.env.OPENAI_BASE_URL ??
    "http://localhost:11434/v1"
  ).replace(/\/$/, "");
  const model = process.env.EMBEDDING_MODEL ?? "nomic-embed-text";
  const dimension = Number(process.env.EMBEDDING_DIMENSION ?? 768);

  return { apiKey, baseUrl, model, dimension };
}

export function getEmbeddingDimension(): number {
  return getEmbeddingConfig().dimension;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const { apiKey, baseUrl, model } = getEmbeddingConfig();
  const response = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Embedding 请求失败 (${response.status}): ${detail}`);
  }

  const json = (await response.json()) as {
    data?: Array<{ embedding?: number[]; index?: number }>;
  };

  const rows = json.data ?? [];
  return rows
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((row) => row.embedding ?? []);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding 结果为空");
  }
  return embedding;
}
