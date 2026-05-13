export const COVER_PRESETS = [
  "violet",
  "ocean",
  "sunset",
  "aurora",
  "ember",
  "mint",
] as const;

export type CoverPresetId = (typeof COVER_PRESETS)[number];

const GRADIENTS: Record<CoverPresetId, string> = {
  violet:
    "from-fuchsia-500 via-violet-600 to-indigo-600 opacity-95 [background-position:center]",
  ocean:
    "from-cyan-400 via-blue-600 to-indigo-700 opacity-95 [background-position:center]",
  sunset:
    "from-amber-400 via-orange-500 to-rose-600 opacity-95 [background-position:center]",
  aurora:
    "from-emerald-400 via-cyan-500 to-blue-600 opacity-95 [background-position:center]",
  ember:
    "from-rose-500 via-orange-600 to-yellow-600 opacity-95 [background-position:center]",
  mint:
    "from-teal-400 via-emerald-500 to-lime-500 opacity-95 [background-position:center]",
};

function hashSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickPresetForSlug(slug: string): CoverPresetId {
  return COVER_PRESETS[hashSlug(slug) % COVER_PRESETS.length]!;
}

export function getGradientClass(preset: CoverPresetId) {
  return GRADIENTS[preset];
}

export function parseCoverFromFrontmatter(
  raw: unknown,
  slug: string,
): { kind: "gradient"; preset: CoverPresetId } | { kind: "image"; src: string } {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { kind: "gradient", preset: pickPresetForSlug(slug) };
  }
  const v = raw.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) {
    return { kind: "image", src: v };
  }
  if (COVER_PRESETS.includes(v as CoverPresetId)) {
    return { kind: "gradient", preset: v as CoverPresetId };
  }
  return { kind: "gradient", preset: pickPresetForSlug(slug) };
}
