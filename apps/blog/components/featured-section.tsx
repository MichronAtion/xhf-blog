"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatPostDate } from "@/lib/format-date";

export type FeaturedPostSummary = {
  slug: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  tag?: string;
};

type Props = { items: FeaturedPostSummary[] };

export function FeaturedSection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      aria-label="推荐文章"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-600 dark:text-fuchsia-400">
        编辑推荐
      </p>
      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {items.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-fuchsia-200/80 bg-gradient-to-br from-white via-white to-fuchsia-50/50 p-6 shadow-sm ring-1 ring-fuchsia-500/10 transition hover:border-fuchsia-300 hover:shadow-[0_20px_48px_-20px_rgba(192,38,211,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 dark:border-fuchsia-900/50 dark:from-zinc-950 dark:via-zinc-950 dark:to-fuchsia-950/20 dark:ring-fuchsia-400/20 dark:hover:border-fuchsia-700/80"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                {post.tag ? (
                  <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 font-medium text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200">
                    {post.tag}
                  </span>
                ) : null}
                {post.category ? (
                  <span className="text-zinc-400 dark:text-zinc-500">{post.category}</span>
                ) : null}
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-fuchsia-800 dark:text-zinc-50 dark:group-hover:text-fuchsia-300">
                {post.title}
              </h2>
              {post.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
              ) : null}
              <span className="mt-4 inline-flex items-center text-sm font-medium text-fuchsia-600 group-hover:underline dark:text-fuchsia-400">
                阅读全文
                <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
