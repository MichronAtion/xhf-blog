import { Suspense } from "react";
import { getAllPosts, toPostListItem } from "@/lib/posts";
import { BlogList } from "@/components/blog-list";

function BlogListFallback() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl animate-pulse px-4 text-sm text-zinc-500">
        加载文章列表…
      </div>
    </div>
  );
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const items = posts.map(toPostListItem);

  return (
    <Suspense fallback={<BlogListFallback />}>
      <BlogList items={items} />
    </Suspense>
  );
}
