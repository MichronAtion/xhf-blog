import { getAllPosts } from "@/lib/posts";
import { groupPostsByCategory } from "@/lib/group-posts";
import { HomeShowcase } from "@/components/home-showcase";

export default async function HomePage() {
  const posts = await getAllPosts();
  const groups = groupPostsByCategory(posts);
  const featured = posts
    .filter((p) => p.featured)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      category: p.category,
      tag: p.tag,
    }));

  return <HomeShowcase groups={groups} featured={featured} />;
}
