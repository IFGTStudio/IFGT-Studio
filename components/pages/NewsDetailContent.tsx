"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapNews } from "@/lib/cms";
import { useLabels } from "@/hooks/useLabels";
import type { NewsItem } from "@/types";

export function NewsDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const { locale, page, ui } = useLabels();
  const labels = page.newsDetail;
  const [item, setItem] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      if (!supabase) {
        setItem(null);
        return;
      }

      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (data) {
        setItem(mapNews(data as Record<string, unknown>, locale));
      } else {
        setItem(null);
      }
    };

    void load();
  }, [slug, locale]);

  if (item === undefined) {
    return (
      <main className="min-h-screen bg-[#050505] pt-40 text-center text-zinc-500">
        {ui.loading}
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#050505] pt-40 text-center">
        <p className="text-zinc-500">{labels.notFound}</p>
        <Link href="/news" className="mt-6 inline-flex items-center gap-2 text-blue-400">
          <ArrowLeft size={16} />
          {labels.back}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-5">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft size={16} />
          {labels.back}
        </Link>
        <div className="mt-8 flex gap-3 text-[11px] font-bold uppercase tracking-widest text-blue-400">
          <span>{item.category}</span>
          <span className="text-zinc-600">{item.date}</span>
        </div>
        <h1 className="mt-5 font-display text-5xl font-medium tracking-[-.06em] sm:text-6xl">{item.title}</h1>
        <div className={`relative mt-10 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br ${item.visual}`}>
          <div className="absolute inset-0 noise opacity-30" />
        </div>
        <p className="mt-10 text-lg leading-8 text-zinc-300">{item.body || item.description}</p>
      </div>
    </main>
  );
}
