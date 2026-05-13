import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Prose } from "@repo/ui";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { formatPostDate } from "@/lib/format-date";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const cat = post.category ?? "未分类";

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Link
          href="/blog"
          className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← 返回列表
        </Link>
        <header className="mt-6 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <Link
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className="rounded-full bg-zinc-200/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-300/90 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {cat}
            </Link>
          </div>
          {post.description ? (
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
          ) : null}
        </header>
        <Prose className="mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </Prose>
      </Container>
    </div>
  );
}
