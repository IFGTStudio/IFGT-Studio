"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "@/components/cards/NewsCard";
import { NewsCardSkeleton } from "@/components/ui/CardSkeleton";
import { createClient } from "@/lib/supabase/client";
import { mapNews } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";
import type { NewsItem } from "@/types";

export function LiveNews() {
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [posts, setPosts] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      const supabase = createClient();
      if (!supabase) {
        setPosts([]);
        return;
      }

      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (data && data.length > 0) {
        setPosts(data.map((p: Record<string, unknown>) => mapNews(p, locale)));
      } else {
        setPosts([]);
      }
    };

    void loadPosts();
  }, [locale]);

  if (posts === null) {
    return (
      <div className="grid gap-9 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-500">{ui.noNews}</div>;
  }

  return (
    <div className="grid gap-9 md:grid-cols-3">
      {posts.map((p, i) => (
        <NewsCard key={p.slug || p.title} item={p} index={i} />
      ))}
    </div>
  );
}
