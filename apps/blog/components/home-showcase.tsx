"use client";

import type { CategoryGroup } from "@/lib/group-posts";
import type { FeaturedPostSummary } from "@/components/featured-section";
import { HomeHero } from "@/components/home-hero";
import { FullBleedCanvas } from "@/components/full-bleed-canvas";
import { CategoryShowcaseSection } from "@/components/category-showcase-section";
import { FeaturedSection } from "@/components/featured-section";

type Props = { groups: CategoryGroup[]; featured: FeaturedPostSummary[] };

export function HomeShowcase({ groups, featured }: Props) {
  return (
    <div id="top" className="flex flex-col">
      <HomeHero />

      <div
        id="modules"
        className="scroll-mt-20 space-y-24 bg-zinc-50 py-24 dark:bg-zinc-950"
      >
        <FeaturedSection items={featured} />
        {groups.length === 0 ? (
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
            还没有已发布的文章。请在 <code>content/posts</code> 添加 Markdown。
          </div>
        ) : (
          groups.map((group, i) => (
            <div key={group.category} className="flex flex-col gap-24">
              <CategoryShowcaseSection group={group} />
              {i < groups.length - 1 ? (
                <FullBleedCanvas
                  variant={i % 2 === 0 ? "dusk" : "noir"}
                  label="MODULE"
                  title={
                    i % 2 === 0
                      ? "下一块内容正在靠近，像幻灯片切换场镜。"
                      : "背景画布为大标题留白，让分类之间的节奏更舒展。"
                  }
                  subtitle="滚动时整块画布会轻微显现，承接上一组卡片与下一组列表的视觉过渡。"
                />
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
