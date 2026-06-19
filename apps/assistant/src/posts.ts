import path from "node:path";
import fs from "node:fs/promises";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  content: string;
};

const contentDir =
  process.env.BLOG_CONTENT_DIR ??
  path.resolve(process.cwd(), "../blog/content/posts");

async function readPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(contentDir, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const meta = data as {
      title?: string;
      description?: string;
      category?: string;
      draft?: boolean;
    };
    if (!meta.title || meta.draft) return null;
    return {
      slug,
      title: meta.title,
      description: meta.description,
      category: meta.category,
      content,
    };
  } catch {
    return null;
  }
}

export async function loadAllPosts(): Promise<BlogPost[]> {
  try {
    const entries = await fs.readdir(contentDir);
    const slugs = entries
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
    const posts = await Promise.all(slugs.map(readPost));
    return posts.filter((p): p is BlogPost => p !== null);
  } catch {
    return [];
  }
}
