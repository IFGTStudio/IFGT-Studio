"use client";

import { useEffect, useState } from "react";
import { GameCard } from "@/components/cards/GameCard";
import { GameCardSkeleton } from "@/components/ui/CardSkeleton";
import type { Game } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapGame } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";

export function LiveGames() {
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [games, setGames] = useState<Game[] | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      const supabase = createClient();
      if (!supabase) {
        setGames([]);
        return;
      }
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setGames(data.map((g: Record<string, unknown>) => mapGame(g, locale)));
      } else {
        setGames([]);
      }
    };

    void loadGames();
  }, [locale]);

  if (games === null) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-500">{ui.noGames}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map((g, i) => (
        <GameCard key={g.slug || g.title} game={g} index={i} />
      ))}
    </div>
  );
}
