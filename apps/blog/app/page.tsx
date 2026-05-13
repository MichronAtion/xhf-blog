import { getAllPosts } from "@/lib/posts";
import { groupPostsByCategory } from "@/lib/group-posts";
import { HomeShowcase } from "@/components/home-showcase";

export default async function HomePage() {
  const posts = await getAllPosts();
  const groups = groupPostsByCategory(posts);

  return <HomeShowcase groups={groups} />;
}
