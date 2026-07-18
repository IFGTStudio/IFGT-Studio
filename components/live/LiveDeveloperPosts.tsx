"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Code2 } from "lucide-react";
import { mapDeveloperPost } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";

type DeveloperPost = {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  video_url?: string;
};

export function LiveDeveloperPosts() {
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [posts, setPosts] = useState<DeveloperPost[] | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      const supabase = createClient();
      if (!supabase) {
        setPosts([]);
        return;
      }

      const { data } = await supabase
        .from("developer_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      setPosts((data ?? []).map((post: Record<string, unknown>) => mapDeveloperPost(post, locale)));
    };

    void loadPosts();
  }, [locale]);

  if (posts === null) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 animate-pulse">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-4 h-7 w-3/4 rounded bg-white/10" />
            <div className="mt-3 h-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-500">{ui.noDeveloperPosts}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <article key={post.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-6">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Code2 size={16} />
            <span>{ui.developerUpdate}</span>
          </div>
          <h3 className="mt-4 font-display text-2xl tracking-[-.04em]">{post.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{post.body}</p>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="mt-4 h-48 w-full rounded-2xl object-cover" />
          )}
          {post.video_url && (
            <a href={post.video_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:border-blue-500">
              {ui.viewVideo}
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
