import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("缺少 DATABASE_URL 环境变量");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const db = getPool();
  const schemaPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "schema.sql",
  );
  const schema = await fs.readFile(schemaPath, "utf8");
  await db.query(schema);
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export function toVectorLiteral(values: number[]): string {
  return `[${values.map((value) => Number(value.toFixed(8))).join(",")}]`;
}

export async function getDbStats(): Promise<{ posts: number; chunks: number }> {
  const db = getPool();
  const [posts, chunks] = await Promise.all([
    db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM posts"),
    db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM chunks"),
  ]);
  return {
    posts: Number(posts.rows[0]?.count ?? 0),
    chunks: Number(chunks.rows[0]?.count ?? 0),
  };
}
