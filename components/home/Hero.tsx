"use client";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/hooks/useLocale";
import { heroLabels } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/use-site-settings";

export function Hero() {
  const locale = useLocale();
  const labels = heroLabels[locale];
  const { getSetting } = useSiteSettings();
  const heroBg = getSetting("hero.backgroundImage");
  const heroVideo = getSetting("hero.backgroundVideo");
  const heroGalleryRaw = getSetting("hero.gallery");
  const [heroGallery, setHeroGallery] = useState<string[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Parse gallery from settings
  useEffect(() => {
    if (heroGalleryRaw) {
      try {
        setHeroGallery(JSON.parse(heroGalleryRaw));
      } catch {
        setHeroGallery([]);
      }
    }
  }, [heroGalleryRaw]);

  // Auto-play gallery
  useEffect(() => {
    if (heroGallery.length === 0) return;
    const interval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % heroGallery.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [heroGallery]);

  // Handle background display priority: Video > Gallery > Image
  const hasVideo = heroVideo?.trim();
  const hasGallery = heroGallery.length > 0;
  const hasImage = heroBg?.trim();

  return (
    <section className="relative flex min-h-[820px] items-end overflow-hidden pt-20">
      {/* Background Video */}
      {hasVideo && (
        <div className="absolute inset-0">
          {heroVideo.includes("youtube.com") || heroVideo.includes("youtu.be") ? (
            <iframe
              src={`${heroVideo.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}?autoplay=1&mute=1&loop=1&playlist=${heroVideo.split("v=")[1] || heroVideo.split("/").pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
              className="w-full h-full object-cover"
              title="Hero Background Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={heroVideo}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {/* Background Gallery (if no video) */}
      {!hasVideo && hasGallery && (
        <div className="absolute inset-0">
          {heroGallery.map((url, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentGalleryIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {url.includes(".mp4") || url.includes(".webm") || url.includes(".mov") ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={url}
                  alt="Hero Gallery Background"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {/* Background Image (if no video or gallery) */}
      {!hasVideo && !hasGallery && hasImage && (
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-[10%] top-[10%] h-[35rem] w-[35rem] rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="absolute right-[-15%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[140px]" />
      <div className="absolute inset-0 noise opacity-20" />
      <Container className="relative z-10 pb-20 sm:pb-28">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-7 text-xs font-bold uppercase tracking-[.3em] text-blue-400">
          {labels.eyebrow}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-display text-[20vw] font-medium leading-[.72] tracking-[-.1em] sm:text-[13vw]">
          {labels.headline}
          <span className="text-blue-500">.</span>
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-16 flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-display text-4xl font-medium leading-tight tracking-[-.05em] sm:text-5xl">
              {labels.line1}
              <br />
              {labels.line2}
              <br />
              <span className="text-zinc-500">{labels.line3}</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/games">{labels.exploreGames}</Button>
              <Button href="/about" variant="secondary">{labels.learnMore}</Button>
            </div>
          </div>
          <p className="max-w-xs border-l border-white/15 pl-5 text-sm leading-6 text-zinc-400">{labels.description}</p>
        </motion.div>
        <div className="absolute bottom-6 right-5 hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
          <ArrowDown size={14} />
          {labels.scroll}
        </div>
      </Container>
    </section>
  );
}
