import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@repo/ui";
import { FormSdkDemo } from "@/components/demos/form-sdk-demo";

export const metadata: Metadata = {
  title: "Form SDK 演示",
  description: "基于 Zod 的框架无关表单处理 SDK 交互演示",
};

export default function FormSdkDemoPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <Link
          href="/demos"
          className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← 返回演示列表
        </Link>

        <header className="mt-6 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="font-mono text-xs text-zinc-500">@repo/form-sdk · v0.1.0</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Form SDK</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            核心 <code className="font-mono text-xs">createForm</code> 不依赖任何 UI
            框架；校验由 Zod schema 驱动。下方演示通过{" "}
            <code className="font-mono text-xs">@repo/form-sdk/react</code> 接入，Vue
            项目可使用 <code className="font-mono text-xs">@repo/form-sdk/vue</code>{" "}
            composable，或直接用原生 API 绑定 DOM。
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            安装
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 font-mono text-xs text-emerald-300">
            {`pnpm add @repo/form-sdk zod\n# React\npnpm add @repo/form-sdk\n# Vue（peer: vue ^3.3）`}
          </pre>
        </section>

        <Suspense
          fallback={
            <div className="mt-8 rounded-2xl border border-zinc-200 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-800">
              加载演示…
            </div>
          }
        >
          <FormSdkDemo />
        </Suspense>
      </Container>
    </div>
  );
}
