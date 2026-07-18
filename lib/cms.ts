import { getLocalizedText, type Locale } from "@/lib/i18n";
import type { Game, NewsItem } from "@/types";

type I18nRecord = Record<string, string> | null | undefined;

function pick(i18n: I18nRecord, legacy: string | null | undefined, locale: Locale) {
  if (i18n && typeof i18n === "object") {
    return getLocalizedText(i18n as Partial<Record<Locale, string>>, locale, legacy ?? "");
  }
  return legacy ?? "";
}

export function mapGame(record: Record<string, unknown>, locale: Locale): Game {
  return {
    slug: String(record.slug ?? ""),
    title: pick(record.title_i18n as I18nRecord, record.title as string, locale),
    genre: pick(record.genre_i18n as I18nRecord, record.genre as string, locale),
    platform: pick(record.platform_i18n as I18nRecord, record.platform as string, locale),
    description: pick(record.description_i18n as I18nRecord, record.description as string, locale),
    visual: String(record.cover_gradient ?? "from-blue-950 via-slate-900 to-cyan-500"),
    status: pick(record.status_i18n as I18nRecord, record.status as string, locale),
    imageUrl: (record.cover_image_url as string) || undefined,
    videoUrl: (record.trailer_url as string) || undefined,
    downloadUrl: (record.download_url as string) || undefined,
  };
}

export function mapNews(record: Record<string, unknown>, locale: Locale): NewsItem {
  const dateSource = (record.published_at ?? record.created_at) as string | undefined;
  return {
    slug: String(record.slug ?? ""),
    title: pick(record.title_i18n as I18nRecord, record.title as string, locale),
    category: pick(record.category_i18n as I18nRecord, record.category as string, locale),
    description: pick(record.excerpt_i18n as I18nRecord, record.excerpt as string, locale),
    body: pick(record.body_i18n as I18nRecord, record.body as string, locale),
    date: dateSource
      ? new Date(dateSource).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    visual: String(record.cover_gradient ?? "from-blue-700 to-slate-950"),
  };
}

export function mapAnnouncement(record: Record<string, unknown>, locale: Locale) {
  return {
    id: String(record.id),
    title: pick(record.title_i18n as I18nRecord, record.title as string, locale),
    body: pick(record.body_i18n as I18nRecord, record.body as string, locale),
  };
}

export function mapJob(record: Record<string, unknown>, locale: Locale) {
  return {
    id: String(record.id),
    title: pick(record.title_i18n as I18nRecord, record.title as string, locale),
    team: pick(record.team_i18n as I18nRecord, record.team as string, locale),
    location: pick(record.location_i18n as I18nRecord, record.location as string, locale),
    description: pick(record.description_i18n as I18nRecord, record.description as string, locale),
    apply_url: (record.apply_url as string) || null,
  };
}

export function mapDeveloperPost(record: Record<string, unknown>, locale: Locale) {
  return {
    id: String(record.id),
    title: pick(record.title_i18n as I18nRecord, record.title as string, locale),
    body: pick(record.body_i18n as I18nRecord, record.body as string, locale),
    image_url: (record.image_url as string) || undefined,
    video_url: (record.video_url as string) || undefined,
  };
}

export function buildI18n(tr: string, en: string) {
  return { tr: tr || en, en: en || tr };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
