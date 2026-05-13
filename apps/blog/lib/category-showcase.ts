export type CategoryShowcaseCopy = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
};

const KNOWN: Record<string, CategoryShowcaseCopy> = {
  人工智能: {
    title: "人工智能的新增功能",
    subtitle: "从智能体编排到多模态体验，持续记录我在 AI 工程上的实验与产品想法。",
    ctaText: "探索代理式人工智能的进展",
    ctaHref: "/blog?category=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD",
  },
  工程实践: {
    title: "工程实践与架构",
    subtitle: "Monorepo、前端与基础设施相关的笔记，偏实战、可走查的路径。",
    ctaText: "查看工程类文章",
    ctaHref: "/blog?category=%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5",
  },
  随笔: {
    title: "随笔与长期思考",
    subtitle: "更轻、更发散的文字，适合随手记录灵感与读后感。",
    ctaText: "阅读随笔",
    ctaHref: "/blog?category=%E9%9A%8F%E7%AC%94",
  },
};

const DEFAULT_CATEGORY_ORDER = ["人工智能", "工程实践", "随笔", "未分类"];

export function showcaseForCategory(category: string): CategoryShowcaseCopy {
  return (
    KNOWN[category] ?? {
      title: category,
      subtitle: `浏览「${category}」分类下的文章与项目记录。`,
      ctaText: "查看该分类",
      ctaHref: `/blog?category=${encodeURIComponent(category)}`,
    }
  );
}

export function sortCategoryKeys(keys: string[]): string[] {
  const set = new Set(keys);
  const ordered: string[] = [];
  for (const k of DEFAULT_CATEGORY_ORDER) {
    if (set.has(k)) ordered.push(k);
  }
  for (const k of keys.sort((a, b) => a.localeCompare(b, "zh-CN"))) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}
