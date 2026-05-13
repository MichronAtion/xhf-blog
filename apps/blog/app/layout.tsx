import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import Link from "next/link";
import { Container } from "@repo/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "我的博客",
    template: "%s · 我的博客",
  },
  description: "用 Next.js 搭建的个人博客",
};

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
          <Container className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              我的博客
            </Link>
            <nav className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                首页
              </Link>
              <Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                文章
              </Link>
            </nav>
          </Container>
        </header>
        <main>{children}</main>
        <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
          <Container>
            <p className="text-center text-xs text-zinc-500">
              © {new Date().getFullYear()} · Monorepo + Next.js + React 18
            </p>
          </Container>
        </footer>
      </body>
    </html>
  );
}
