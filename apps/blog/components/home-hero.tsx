"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { noiseBackgroundUrl } from "@/lib/noise-texture";

export function HomeHero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative isolate w-full overflow-hidden"
      style={{ minHeight: "min(92vh, 860px)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(1200px_560px_at_10%_-10%,rgba(219,39,119,0.45),transparent),radial-gradient(900px_480px_at_95%_15%,rgba(99,102,241,0.55),transparent),radial-gradient(700px_420px_at_50%_115%,rgba(52,211,153,0.4),transparent),linear-gradient(165deg,#020617,#0b1024_40%,#1e1b4b_78%,#312e81)]" />
      <div
        className="absolute inset-0 opacity-[0.28] mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 52%), linear-gradient(to bottom, rgba(15,23,42,0.15), rgba(15,23,42,0.85))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: noiseBackgroundUrl() }}
      />

      <div
        className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pb-24 pt-32 sm:px-6 lg:px-8"
        style={{ minHeight: "min(92vh, 860px)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            PERSONAL BLOG · REACT 18 · NEXT.JS
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            把文章分类陈列，让每一次滚动都像翻到下一张幻灯片。
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
            首页用大幅背景画布分区叙事；每个分类是一块独立模块，卡片在进入视野时顺滑浮现，并带有柔和的光晕悬停反馈。
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="#modules"
              className="inline-flex items-center justify-center rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-black/25 transition hover:bg-white"
            >
              向下探索模块
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-white/10"
            >
              文章归档
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
