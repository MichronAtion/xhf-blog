"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Post } from "@/lib/posts";
import { getGradientClass } from "@/lib/cover-presets";

type Props = {
  post: Post;
  index: number;
};

const ITEM = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ArticleCard({ post, index }: Props) {
  const label = post.tag ?? "Article";
  const cover = post.resolvedCover;

  return (
    <motion.article
      layout
      variants={ITEM}
      className="group h-full"
      style={{ perspective: "1200px" }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] ring-1 ring-zinc-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.2),0_24px_56px_-16px_rgba(168,85,247,0.42),0_0_80px_-24px_rgba(236,72,153,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 dark:bg-zinc-950/80 dark:ring-zinc-800 dark:hover:shadow-[0_0_0_1px_rgba(192,132,252,0.25),0_24px_56px_-16px_rgba(147,51,234,0.45),0_0_80px_-24px_rgba(236,72,153,0.28)]"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {cover.kind === "image" ? (
            <Image
              src={cover.src}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
              priority={index === 0}
              unoptimized={/^https?:\/\//.test(cover.src)}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br transition duration-700 group-hover:scale-105 ${getGradientClass(cover.preset)}`}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.42),transparent_55%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.18),transparent_45%)] mix-blend-soft-light" />
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-900 shadow-sm backdrop-blur-sm dark:bg-zinc-950/75 dark:text-zinc-50">
            {label}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-base font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
            {post.title}
          </h3>
          {post.description ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
