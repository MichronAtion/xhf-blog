"use client";

import { motion } from "framer-motion";
import { noiseBackgroundUrl } from "@/lib/noise-texture";

type Props = {
  variant?: "aurora" | "dusk" | "noir";
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

const SKINS: Record<NonNullable<Props["variant"]>, string> = {
  aurora:
    "bg-[radial-gradient(1000px_420px_at_15%_12%,rgba(165,180,252,0.55),transparent),radial-gradient(900px_500px_at_88%_30%,rgba(244,114,182,0.45),transparent),radial-gradient(700px_380px_at_45%_95%,rgba(45,212,191,0.35),transparent),linear-gradient(115deg,#0f172a,#1e1b4b_45%,#312e81)]",
  dusk: "bg-[radial-gradient(820px_400px_at_12%_20%,rgba(251,146,60,0.35),transparent),radial-gradient(760px_420px_at_92%_40%,rgba(244,63,94,0.42),transparent),linear-gradient(125deg,#0b1220,#3b0764_40%,#4c0519)]",
  noir: "bg-[radial-gradient(900px_440px_at_50%_-10%,rgba(148,163,184,0.35),transparent),linear-gradient(145deg,#020617,#0f172a_50%,#1e293b)]",
};

export function FullBleedCanvas({
  variant = "aurora",
  label,
  title,
  subtitle,
  className = "",
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 1.02 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={`relative isolate min-h-[46vh] w-full overflow-hidden ${SKINS[variant]} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: noiseBackgroundUrl() }}
      />
      <div className="relative mx-auto flex min-h-[46vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        {label ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {label}
          </p>
        ) : null}
        <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </motion.section>
  );
}
