/** SVG noise tile as data URL — use with style={{ backgroundImage: noiseBgUrl }} to avoid Tailwind/SWC parse issues. */
export const NOISE_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

export function noiseBackgroundUrl() {
  return `url("${NOISE_DATA_URL}")`;
}
