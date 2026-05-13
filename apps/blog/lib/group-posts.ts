import type { Post } from "@/lib/posts";
import { sortCategoryKeys, showcaseForCategory } from "@/lib/category-showcase";

export type CategoryGroup = {
  category: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  posts: Post[];
};

export function groupPostsByCategory(posts: Post[]): CategoryGroup[] {
  const map = new Map<string, Post[]>();
  for (const p of posts) {
    const c = p.category ?? "未分类";
    const list = map.get(c);
    if (list) list.push(p);
    else map.set(c, [p]);
  }
  const keys = sortCategoryKeys([...map.keys()]);
  return keys.map((category) => {
    const copy = showcaseForCategory(category);
    return {
      category,
      title: copy.title,
      subtitle: copy.subtitle,
      ctaText: copy.ctaText,
      ctaHref: copy.ctaHref,
      posts: (map.get(category) ?? []).sort((a, b) =>
        a.date < b.date ? 1 : -1,
      ),
    };
  });
}
