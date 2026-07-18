"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Newspaper } from "lucide-react";
import { mapAnnouncement } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";

type Announcement = {
  id: string;
  title: string;
  body: string;
};

export function LiveAnnouncements() {
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [items, setItems] = useState<Announcement[] | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      const supabase = createClient();
      if (!supabase) {
        setItems([]);
        return;
      }

      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      setItems((data ?? []).map((item: Record<string, unknown>) => mapAnnouncement(item, locale)));
    };

    void loadItems();
  }, [locale]);

  if (items === null) {
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

  if (!items.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-500">{ui.noAnnouncements}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Newspaper size={16} />
            <span>{ui.announcement}</span>
          </div>
          <h3 className="mt-4 font-display text-2xl tracking-[-.04em]">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
