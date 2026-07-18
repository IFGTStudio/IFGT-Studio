"use client";
import Link from "next/link";
import { Instagram, Linkedin, Youtube, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { useLocale } from "@/hooks/useLocale";
import { navLabels } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/use-site-settings";

export function Footer() {
  const locale = useLocale();
  const nav = navLabels[locale];
  const { getSetting } = useSiteSettings();

  // Sosyal medya bağlantıları - site settings'ten alınıyor
  const socialLinks = [
    { icon: Instagram, href: getSetting("social.instagram") },
    { icon: Linkedin, href: getSetting("social.linkedin") },
    { icon: Youtube, href: getSetting("social.youtube") },
  ];
	
  return (
    <footer className="border-t border-white/[.08] bg-[#080808] py-14">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center">
              <Logo size="xxxl" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
              {getSetting("footer.tagline")}
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {getSetting("footer.explore")}
            </p>
            <div className="flex flex-col gap-3 text-sm text-zinc-300">
              {["games", "news", "careers", "about"].map((key) => (
                <Link key={key} href={`/${key}`}>
                  {nav[key as keyof typeof nav]}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {getSetting("footer.connect")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href }, i) => (
                href && (
                  <a key={i} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 p-2.5 text-zinc-300 transition hover:border-blue-500 hover:text-white">
                    <Icon size={16} />
                  </a>
                )
              ))}
            </div>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-1 text-sm text-blue-400">
              {getSetting("footer.say_hello")} <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/[.08] pt-5 text-xs text-zinc-600 sm:flex-row">
          <span>{getSetting("footer.rights")}</span>
          <div className="flex gap-4">
            <Link href="/privacy">{getSetting("footer.privacy")}</Link>
            <Link href="/terms">{getSetting("footer.terms")}</Link>
            <Link href="/accessibility">{getSetting("footer.accessibility")}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
