"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CategoryGroup } from "@/lib/group-posts";
import { ArticleCard } from "@/components/article-card";

const SECTION = {
  hidden: { opacity: 0, y: 56 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const GRID = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

type Props = { group: CategoryGroup };

export function CategoryShowcaseSection({ group }: Props) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      variants={SECTION}
      className="scroll-mt-24"
      id={`cat-${encodeURIComponent(group.category)}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {group.title}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              {group.subtitle}
            </p>
          </div>
          <Link
            href={group.ctaHref}
            className="shrink-0 border-b border-zinc-400 pb-0.5 text-sm font-medium text-zinc-800 transition hover:border-fuchsia-500 hover:text-fuchsia-600 dark:border-zinc-500 dark:text-zinc-200 dark:hover:border-fuchsia-400 dark:hover:text-fuchsia-300"
          >
            {group.ctaText}
          </Link>
        </header>
        <motion.div
          variants={GRID}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {group.posts.map((post, i) => (
            <ArticleCard key={post.slug} post={post} index={i} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
