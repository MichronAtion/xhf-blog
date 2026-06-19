import "dotenv/config";
import { createHash } from "node:crypto";
import { chunkMarkdown } from "./chunk.js";
import { closeDb, getPool, initDb, toVectorLiteral } from "./db/client.js";
import { embedTexts, getEmbeddingDimension } from "./embed.js";
import { loadAllPosts } from "./posts.js";

const BATCH_SIZE = 8;

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function upsertPost(post: Awaited<ReturnType<typeof loadAllPosts>>[number]) {
  const db = getPool();
  const contentHash = hashContent(post.content);

  const existing = await db.query<{ id: number; content_hash: string }>(
    "SELECT id, content_hash FROM posts WHERE slug = $1",
    [post.slug],
  );

  const row = existing.rows[0];
  if (row && row.content_hash === contentHash) {
    console.log(`skip ${post.slug} (unchanged)`);
    return;
  }

  const saved = await db.query<{ id: number }>(
    `
    INSERT INTO posts (slug, title, description, category, content_hash, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      content_hash = EXCLUDED.content_hash,
      updated_at = NOW()
    RETURNING id
    `,
    [post.slug, post.title, post.description ?? null, post.category ?? null, contentHash],
  );

  const postId = saved.rows[0]?.id;
  if (!postId) {
    throw new Error(`保存文章失败: ${post.slug}`);
  }

  await db.query("DELETE FROM chunks WHERE post_id = $1", [postId]);
  const chunks = chunkMarkdown(post.content);
  if (chunks.length === 0) {
    console.log(`warn ${post.slug} has no chunks`);
    return;
  }

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(batch);

    for (let j = 0; j < batch.length; j += 1) {
      const content = batch[j];
      const embedding = embeddings[j];
      if (!content || !embedding?.length) continue;

      await db.query(
        `
        INSERT INTO chunks (post_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4::vector)
        `,
        [postId, i + j, content, toVectorLiteral(embedding)],
      );
    }
  }

  console.log(`ingested ${post.slug}: ${chunks.length} chunks`);
}

async function main() {
  await initDb();
  const dimension = getEmbeddingDimension();
  console.log(`embedding dimension: ${dimension}`);

  const posts = await loadAllPosts();
  if (posts.length === 0) {
    console.log("no posts found");
    await closeDb();
    return;
  }

  for (const post of posts) {
    await upsertPost(post);
  }

  const stats = await getPool().query<{ posts: string; chunks: string }>(
    `
    SELECT
      (SELECT COUNT(*)::text FROM posts) AS posts,
      (SELECT COUNT(*)::text FROM chunks) AS chunks
    `,
  );
  console.log(
    `done: ${stats.rows[0]?.posts ?? 0} posts, ${stats.rows[0]?.chunks ?? 0} chunks indexed`,
  );
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exit(1);
});
