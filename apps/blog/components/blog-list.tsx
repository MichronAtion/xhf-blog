"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@repo/ui";
import { formatPostDate } from "@/lib/format-date";
import type { PostListItem } from "@/lib/posts";

type Props = { items: PostListItem[] };

export function BlogList({ items }: Props) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("category");
  const activeCategory = raw ? decodeURIComponent(raw) : undefined;
  const filtered = activeCategory
    ? items.filter((p) => (p.category ?? "未分类") === activeCategory)
    : items;

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {activeCategory ? `「${activeCategory}」分类` : "全部文章"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              共 {filtered.length} 篇
              {activeCategory ? (
                <>
                  {" "}
                  <Link
                    href="/blog"
                    className="text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    清除筛选
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <Link
            href="/#modules"
            className="text-sm text-fuchsia-600 hover:underline dark:text-fuchsia-400"
          >
            返回首页分区
          </Link>
        </div>
        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {filtered.map((post) => (
            <li key={post.slug} className="py-6">
              <article>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                >
                  <h2 className="text-lg font-medium text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-50 dark:group-hover:text-emerald-300">
                    {post.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    {post.category ? (
                      <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {post.category}
                      </span>
                    ) : null}
                  </div>
                  {post.description ? (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {post.description}
                    </p>
                  ) : null}
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
