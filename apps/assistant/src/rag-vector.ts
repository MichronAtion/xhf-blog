import { excerpt } from "./chunk.js";
import { getPool, toVectorLiteral } from "./db/client.js";
import { embedText } from "./embed.js";
import type { Citation, RetrievedChunk } from "./types.js";

function mapRow(row: {
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  content: string;
  chunk_index: number;
  similarity: number | string;
}): RetrievedChunk {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    content: row.content,
    chunkIndex: row.chunk_index,
    similarity: Number(row.similarity),
  };
}

export async function searchSimilarChunks(
  query: string,
  options?: { limit?: number; contextSlug?: string },
): Promise<RetrievedChunk[]> {
  const limit = options?.limit ?? 5;
  const db = getPool();
  const embedding = await embedText(query);
  const vector = toVectorLiteral(embedding);

  const pinned = options?.contextSlug
    ? (
        await db.query<{
          slug: string;
          title: string;
          description: string | null;
          category: string | null;
          content: string;
          chunk_index: number;
          similarity: number | string;
        }>(
          `
          SELECT p.slug, p.title, p.description, p.category, c.content, c.chunk_index,
                 1 - (c.embedding <=> $1::vector) AS similarity
          FROM chunks c
          JOIN posts p ON p.id = c.post_id
          WHERE p.slug = $2 AND c.embedding IS NOT NULL
          ORDER BY c.embedding <=> $1::vector
          LIMIT 2
          `,
          [vector, options.contextSlug],
        )
      ).rows.map(mapRow)
    : [];

  const global = (
    await db.query<{
      slug: string;
      title: string;
      description: string | null;
      category: string | null;
      content: string;
      chunk_index: number;
      similarity: number | string;
    }>(
      `
      SELECT p.slug, p.title, p.description, p.category, c.content, c.chunk_index,
             1 - (c.embedding <=> $1::vector) AS similarity
      FROM chunks c
      JOIN posts p ON p.id = c.post_id
      WHERE c.embedding IS NOT NULL
      ORDER BY c.embedding <=> $1::vector
      LIMIT $2
      `,
      [vector, limit],
    )
  ).rows.map(mapRow);

  const merged: RetrievedChunk[] = [];
  for (const item of [...pinned, ...global]) {
    if (merged.some((existing) => existing.slug === item.slug && existing.chunkIndex === item.chunkIndex)) {
      continue;
    }
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export function buildRagContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "（向量库中暂无可用文章片段，请先执行 ingest。）";
  }

  return chunks
    .map((chunk, index) => {
      const meta = [
        `标题：${chunk.title}`,
        chunk.category ? `分类：${chunk.category}` : null,
        chunk.description ? `摘要：${chunk.description}` : null,
        `相似度：${chunk.similarity.toFixed(3)}`,
      ]
        .filter(Boolean)
        .join("\n");

      return [`## 参考 ${index + 1}（slug: ${chunk.slug}）`, meta, chunk.content].join(
        "\n",
      );
    })
    .join("\n\n");
}

export function toCitations(chunks: RetrievedChunk[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const chunk of chunks) {
    if (seen.has(chunk.slug)) continue;
    seen.add(chunk.slug);
    citations.push({
      slug: chunk.slug,
      title: chunk.title,
      excerpt: excerpt(chunk.content),
      similarity: chunk.similarity,
    });
  }

  return citations;
}

export async function retrieveVectorContext(
  query: string,
  contextSlug?: string,
): Promise<{ context: string; citations: Citation[] }> {
  const chunks = await searchSimilarChunks(query, { limit: 5, contextSlug });
  return {
    context: buildRagContext(chunks),
    citations: toCitations(chunks),
  };
}
