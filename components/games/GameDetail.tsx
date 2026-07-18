"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Download, Play, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapGame } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";
import type { Game } from "@/types";

type PlatformKey = "steam" | "epic" | "appstore" | "playstore" | "xbox" | "ps";

type PlatformLink = Partial<Record<PlatformKey, string>>;

type GameRecord = {
  slug: string;
  title: string;
  genre: string;
  platform: string;
  description: string;
  cover_image_url?: string;
  image_gallery?: string[];
  trailer_url?: string;
  video_gallery?: string[];
  platform_links?: PlatformLink;
  cover_gradient?: string;
  status?: string;
  download_url?: string;
};

const platformLabels: Record<PlatformKey, string> = {
  steam: "Steam",
  epic: "Epic Games",
  appstore: "App Store",
  playstore: "Play Store",
  xbox: "Xbox",
  ps: "PlayStation",
};

const platformLogos: Record<PlatformKey, string> = {
  steam: "/logos/steam.png",
  epic: "/logos/epic.png",
  appstore: "/logos/appstore.png",
  playstore: "/logos/playstore.png",
  xbox: "/logos/xbox.png",
  ps: "/logos/playstation.png",
};

export function GameDetail() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [game, setGame] = useState<(Game & Partial<GameRecord>) | null | undefined>(undefined);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadGame = async () => {
      const supabase = createClient();
      if (!supabase) {
        setGame(null);
        return;
      }

      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (data) {
        const mapped = mapGame(data as Record<string, unknown>, locale);
        setGame({ ...mapped, ...(data as GameRecord), downloadUrl: (data as GameRecord).download_url });
      } else {
        setGame(null);
      }
    };

    void loadGame();
  }, [slug, locale]);

  if (game === undefined)
    return (
      <main className="min-h-screen bg-[#050505] pt-40 text-center text-zinc-500">
        {ui.loading}
      </main>
    );

  if (!game)
    return (
      <main className="min-h-screen bg-[#050505] pt-40 text-center">
        <p className="text-zinc-500">{ui.gameNotFound}</p>
        <Link href="/games" className="mt-6 inline-flex items-center gap-2 text-blue-400">
          <ArrowLeft size={16} />
          {locale === "tr" ? "Oyunlara dön" : "Back to games"}
        </Link>
      </main>
    );

  const images = [game.cover_image_url, ...((game as any).image_gallery ?? [])].filter(
    (value): value is string => Boolean(value)
  );
  const videos = [game.videoUrl, ...((game as any).video_gallery ?? [])].filter(
    (value): value is string => Boolean(value)
  );
  const platformLinks: PlatformLink = (game as any).platform_links || {};

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-20">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Link href="/games" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft size={16} />
          {locale === "tr" ? "Oyunlara dön" : "Back to games"}
        </Link>
        <div className="mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-400">
          <span>{game.genre}</span>
          <span className="text-zinc-600">·</span>
          <span>{game.platform}</span>
          {game.status && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{game.status}</span>
            </>
          )}
        </div>
        <h1 className="mt-4 font-display text-6xl tracking-[-.07em]">
          {game.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          {game.description}
        </p>

        {/* Steam-style Gallery */}
        <section className="mt-12">
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 cursor-pointer group">
            {images[active] ? (
              <img
                src={images[active]}
                alt={game.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onClick={() => openLightbox(active)}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${game.visual}`}>
                <div className="absolute inset-0 noise opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
                <Play size={32} className="text-white" />
              </div>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-20 w-32 shrink-0 overflow-hidden rounded-lg border transition-all ${
                    i === active
                      ? "border-blue-500 ring-2 ring-blue-500/50"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Platform Download Buttons */}
        {(platformLinks && Object.keys(platformLinks).length > 0 || game?.downloadUrl) && (
          <section className="mt-12">
            <h2 className="font-display text-2xl">{ui.platforms}</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {/* Our site's download button first */}
              {game?.downloadUrl && (
                <a
                  href={game.downloadUrl}
                  download
                  className="flex items-center gap-3 rounded-xl border border-blue-500 bg-blue-600/20 px-5 py-3 transition hover:bg-blue-600/30"
                >
                  <img
                    src="/logos/ifgt.png"
                    alt="IFGT"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium">
                    {locale === "tr" ? "IFGT'den İndir" : "Download from IFGT"}
                  </span>
                </a>
              )}
              {/* Platform buttons */}
              {platformLinks && Object.entries(platformLinks).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-5 py-3 transition hover:border-blue-500 hover:bg-blue-500/10"
                >
                  <img
                    src={platformLogos[key as PlatformKey]}
                    alt={platformLabels[key as PlatformKey]}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium">
                    {platformLabels[key as PlatformKey]}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-3xl">{ui.videos}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {videos.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-blue-500 hover:bg-blue-500/10"
                >
                  <div className="rounded-full bg-blue-600 p-3">
                    <Play size={20} className="text-white" />
                  </div>
                  <span className="text-blue-300 group-hover:text-white">
                    {ui.openTrailer}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <img
            src={images[lightboxIndex]}
            alt={game.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </main>
  );
}
