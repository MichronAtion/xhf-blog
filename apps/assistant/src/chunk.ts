const DEFAULT_MAX_CHARS = 600;

export function chunkMarkdown(content: string, maxChars = DEFAULT_MAX_CHARS): string[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const sections = normalized.split(/(?=^#{1,3}\s)/m).filter((part) => part.trim());
  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= maxChars) {
      chunks.push(section.trim());
      continue;
    }

    const paragraphs = section.split(/\n\n+/);
    let buffer = "";

    for (const paragraph of paragraphs) {
      const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      if (candidate.length > maxChars && buffer) {
        chunks.push(buffer.trim());
        buffer = paragraph;
      } else {
        buffer = candidate;
      }
    }

    if (buffer.trim()) {
      if (buffer.length <= maxChars) {
        chunks.push(buffer.trim());
      } else {
        for (let i = 0; i < buffer.length; i += maxChars) {
          chunks.push(buffer.slice(i, i + maxChars).trim());
        }
      }
    }
  }

  return chunks.filter((chunk) => chunk.length >= 20);
}

export function excerpt(text: string, maxLength = 180): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}
