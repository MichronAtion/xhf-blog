import type { Post, PostCard } from "@/lib/posts";
import { toPostCard } from "@/lib/posts";
import { sortCategoryKeys, showcaseForCategory } from "@/lib/category-showcase";

export type CategoryGroup = {
  category: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  posts: PostCard[];
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
    const sorted = (map.get(category) ?? []).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
    return {
      category,
      title: copy.title,
      subtitle: copy.subtitle,
      ctaText: copy.ctaText,
      ctaHref: copy.ctaHref,
      posts: sorted.map(toPostCard),
    };
  });
}
