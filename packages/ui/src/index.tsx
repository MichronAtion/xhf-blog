import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function Prose({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 ${className}`}
    >
      {children}
    </div>
  );
}
