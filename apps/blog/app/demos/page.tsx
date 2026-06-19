import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@repo/ui";

export const metadata: Metadata = {
  title: "技术演示",
  description: "开源 SDK 与实验性功能的可交互演示",
};

const DEMOS = [
  {
    slug: "form-sdk",
    title: "Form SDK",
    description:
      "基于 Zod 的框架无关表单处理库。核心逻辑零 UI 依赖，React / Vue 通过薄适配层接入。",
    tags: ["Zod", "React", "Vue", "npm"],
    status: "beta" as const,
  },
];

export default function DemosIndexPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">技术演示</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            可交互的 live demo，展示计划发布到 npm 的 SDK 与实验性功能。核心包不绑定
            React 或 Vue，演示页仅作为消费方之一。
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {DEMOS.map((demo) => (
            <li key={demo.slug}>
              <Link
                href={`/demos/${demo.slug}`}
                className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-zinc-900 group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                    {demo.title}
                  </h2>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {demo.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {demo.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
