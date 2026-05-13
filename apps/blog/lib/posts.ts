import path from "node:path";
import fs from "node:fs/promises";
import matter from "gray-matter";
import { parseCoverFromFrontmatter, type CoverPresetId } from "@/lib/cover-presets";

export type PostMeta = {
  title: string;
  date: string;
  description?: string;
  /** 设为 true 时在首页置顶展示推荐卡片 */
  featured?: boolean;
  draft?: boolean;
  category?: string;
  /** 卡片左上角标签，例如 Service / Dev */
  tag?: string;
  /** 封面：预设名（violet、ocean…）或以 / 或 http 开头的图片路径 */
  cover?: string;
};

export type PostCover =
  | { kind: "gradient"; preset: CoverPresetId }
  | { kind: "image"; src: string };

/** 列表 / 卡片用，不含正文，便于静态导出与减小 RSC 边界序列化体积 */
export type PostCard = Omit<
  PostMeta,
  "draft" | "cover" | "featured"
> & {
  slug: string;
  resolvedCover: PostCover;
};

export type Post = PostMeta & {
  slug: string;
  content: string;
  resolvedCover: PostCover;
};

export type PostListItem = Pick<
  Post,
  "slug" | "title" | "date" | "description" | "category"
>;

export function toPostCard(p: Post): PostCard {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
    category: p.category,
    tag: p.tag,
    resolvedCover: p.resolvedCover,
  };
}

export function toPostListItem(p: Post): PostListItem {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
    category: p.category,
  };
}

const contentDir = path.join(process.cwd(), "content/posts");

async function readPostFile(slug: string): Promise<Post | null> {
  const filePath = path.join(contentDir, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const meta = data as Partial<PostMeta>;
    if (!meta.title || !meta.date) return null;
    const resolvedCover = parseCoverFromFrontmatter(meta.cover, slug);
    return {
      slug,
      title: meta.title,
      date: meta.date,
      description: meta.description,
      draft: meta.draft,
      featured: meta.featured,
      category: meta.category,
      tag: meta.tag,
      cover: meta.cover,
      content,
      resolvedCover,
    };
  } catch {
    return null;
  }
}

export async function getPostSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(contentDir);
    return entries
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map((s) => readPostFile(s)));
  return posts
    .filter((p): p is Post => p !== null && !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await readPostFile(slug);
  if (!post || post.draft) return null;
  return post;
}
