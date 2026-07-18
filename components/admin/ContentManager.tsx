"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Play, Instagram, Linkedin, Youtube, Gamepad2, Monitor, Smartphone, AppWindow, Globe, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Tab = "games" | "news";
type Item = {
  id: string;
  title: string;
  published: boolean;
  title_i18n?: { tr?: string; en?: string };
  genre_i18n?: { tr?: string; en?: string };
  platform_i18n?: { tr?: string; en?: string };
  status_i18n?: { tr?: string; en?: string };
  description_i18n?: { tr?: string; en?: string };
  category_i18n?: { tr?: string; en?: string };
  excerpt_i18n?: { tr?: string; en?: string };
  body_i18n?: { tr?: string; en?: string };
  cover_image_url?: string;
  trailer_url?: string;
  platform_links?: Record<string, string>;
  team_i18n?: { tr?: string; en?: string };
  location_i18n?: { tr?: string; en?: string };
  apply_url?: string;
  image_gallery?: string[];
  video_gallery?: string[];
};

// Platform icons and labels
const platforms = [
  { key: "steam", label: "Steam", icon: Gamepad2 },
  { key: "epic", label: "Epic Games", icon: Globe },
  { key: "appstore", label: "App Store", icon: AppWindow },
  { key: "playstore", label: "Play Store", icon: Smartphone },
  { key: "xbox", label: "Xbox", icon: Trophy },
  { key: "ps", label: "PlayStation", icon: Monitor },
] as const;

export function ContentManager() {
  const [tab, setTab] = useState<Tab>("games");
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [videoGallery, setVideoGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const table = tab === "games" ? "games" : "news_posts";

  const load = async () => {
    if (!supabase) {
      setItems([]);
      return;
    }

    const { data } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Item[]);
  };

  useEffect(() => {
    load();
  }, [tab]);

  // Upload file to Supabase Storage
  const handleFileUpload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("media")
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Dosya yükleme başarısız!");
    } finally {
      setUploading(false);
    }
  };

  const save = async (formData: FormData) => {
    if (!supabase) {
      setMessage("İçerik yönetimi için Supabase yapılandırması gerekiyor.");
      return;
    }
    const title_en = String(formData.get("title_en"));
    const title_tr = String(formData.get("title_tr"));
    const title = title_en || title_tr;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const published = formData.get("published") === "on";

    // Platform links to JSON
    const platform_links: Record<string, string> = {};
    for (const p of platforms) {
      const url = String(formData.get(`platform_${p.key}`) || "");
      if (url) {
        platform_links[p.key] = url;
      }
    }

    // Build i18n JSONB objects
    const title_i18n = { tr: title_tr || title_en, en: title_en || title_tr };

    if (editingId) {
      if (tab === "games") {
        const genre_en = String(formData.get("genre_en"));
        const genre_tr = String(formData.get("genre_tr"));
        const desc_en = String(formData.get("description_en"));
        const desc_tr = String(formData.get("description_tr"));
        const status_en = String(formData.get("status_en"));
        const status_tr = String(formData.get("status_tr"));
        const genre_i18n = { tr: genre_tr || genre_en, en: genre_en || genre_tr };
        const description_i18n = { tr: desc_tr || desc_en, en: desc_en || desc_tr };
        const status_i18n = { tr: status_tr || status_en, en: status_en || status_tr };

        const { error } = await supabase
          .from("games")
          .update({
            title,
            title_i18n,
            published,
            genre: genre_en || genre_tr,
            genre_i18n,
            description: desc_en || desc_tr,
            description_i18n,
            status: status_en || status_tr,
            status_i18n,
            cover_image_url: String(formData.get("imageUrl")) || null,
                    trailer_url: String(formData.get("videoUrl")) || null,
                    download_url: String(formData.get("downloadUrl")) || null,
                    platform_links,
                    image_gallery: imageGallery,
                    video_gallery: videoGallery,
          })
          .eq("id", editingId);
        setMessage(error ? error.message : "Oyun güncellendi.");
      } else {
        const cat_en = String(formData.get("category_en"));
        const cat_tr = String(formData.get("category_tr"));
        const excerpt_en = String(formData.get("excerpt_en"));
        const excerpt_tr = String(formData.get("excerpt_tr"));
        const body_en = String(formData.get("body_en"));
        const body_tr = String(formData.get("body_tr"));
        const category_i18n = { tr: cat_tr || cat_en, en: cat_en || cat_tr };
        const excerpt_i18n = { tr: excerpt_tr || excerpt_en, en: excerpt_en || excerpt_tr };
        const body_i18n = { tr: body_tr || body_en, en: body_en || body_tr };

        const { error } = await supabase
          .from("news_posts")
          .update({
            title,
            title_i18n,
            published,
            category: cat_en || cat_tr,
            category_i18n,
            excerpt: excerpt_en || excerpt_tr,
            excerpt_i18n,
            body: body_en || body_tr,
            body_i18n,
            published_at: published ? new Date().toISOString() : null,
          })
          .eq("id", editingId);
        setMessage(error ? error.message : "Haber güncellendi.");
      }
      setEditingId(null);
      setImageGallery([]);
      setVideoGallery([]);
    } else {
      if (tab === "games") {
        const genre_en = String(formData.get("genre_en"));
        const genre_tr = String(formData.get("genre_tr"));
        const desc_en = String(formData.get("description_en"));
        const desc_tr = String(formData.get("description_tr"));
        const status_en = String(formData.get("status_en"));
        const status_tr = String(formData.get("status_tr"));
        const genre_i18n = { tr: genre_tr || genre_en, en: genre_en || genre_tr };
        const description_i18n = { tr: desc_tr || desc_en, en: desc_en || desc_tr };
        const status_i18n = { tr: status_tr || status_en, en: status_en || status_tr };

        const { error } = await supabase
          .from("games")
          .insert({
            title,
            slug,
            title_i18n,
            published,
            genre: genre_en || genre_tr,
            genre_i18n,
            description: desc_en || desc_tr,
            description_i18n,
            status: status_en || status_tr,
            status_i18n,
            cover_gradient: "from-blue-950 via-slate-900 to-cyan-500",
            cover_image_url: String(formData.get("imageUrl")) || null,
                    trailer_url: String(formData.get("videoUrl")) || null,
                    download_url: String(formData.get("downloadUrl")) || null,
                    platform_links,
                    image_gallery: imageGallery,
                    video_gallery: videoGallery,
          });
        setMessage(error ? error.message : "Oyun kaydedildi.");
      } else {
        const cat_en = String(formData.get("category_en"));
        const cat_tr = String(formData.get("category_tr"));
        const excerpt_en = String(formData.get("excerpt_en"));
        const excerpt_tr = String(formData.get("excerpt_tr"));
        const body_en = String(formData.get("body_en"));
        const body_tr = String(formData.get("body_tr"));
        const category_i18n = { tr: cat_tr || cat_en, en: cat_en || cat_tr };
        const excerpt_i18n = { tr: excerpt_tr || excerpt_en, en: excerpt_en || excerpt_tr };
        const body_i18n = { tr: body_tr || body_en, en: body_en || body_tr };

        const { error } = await supabase
          .from("news_posts")
          .insert({
            title,
            slug,
            title_i18n,
            published,
            category: cat_en || cat_tr,
            category_i18n,
            excerpt: excerpt_en || excerpt_tr,
            excerpt_i18n,
            body: body_en || body_tr,
            body_i18n,
            cover_gradient: "from-blue-700 to-slate-950",
            published_at: published ? new Date().toISOString() : null,
          });
        setMessage(error ? error.message : "Haber kaydedildi.");
      }
      setImageGallery([]);
      setVideoGallery([]);
    }
    (document.getElementById("cms-form") as HTMLFormElement).reset();
    load();
  };

  const togglePublish = async (id: string, published: boolean) => {
    if (!supabase) return;

    const { error } = await supabase
      .from(table)
      .update({ published: !published })
      .eq("id", id);
    if (!error) load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Silmek istediğine emin misin?")) return;
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) load();
  };

  const editItem = (item: Item) => {
    setEditingId(item.id);
    const form = document.getElementById("cms-form") as HTMLFormElement;

    // Fill in title fields
    const titleEn = form.querySelector('[name="title_en"]') as HTMLInputElement;
    const titleTr = form.querySelector('[name="title_tr"]') as HTMLInputElement;
    if (titleEn) titleEn.value = item.title_i18n?.en || item.title || "";
    if (titleTr) titleTr.value = item.title_i18n?.tr || item.title || "";

    if (tab === "games") {
      // Games specific fields
      const genreEn = form.querySelector('[name="genre_en"]') as HTMLInputElement;
      const genreTr = form.querySelector('[name="genre_tr"]') as HTMLInputElement;
      const descEn = form.querySelector('[name="description_en"]') as HTMLTextAreaElement;
      const descTr = form.querySelector('[name="description_tr"]') as HTMLTextAreaElement;
      const statusEn = form.querySelector('[name="status_en"]') as HTMLInputElement;
      const statusTr = form.querySelector('[name="status_tr"]') as HTMLInputElement;
      const imageUrl = form.querySelector('[name="imageUrl"]') as HTMLInputElement;
              const videoUrl = form.querySelector('[name="videoUrl"]') as HTMLInputElement;
              const downloadUrl = form.querySelector('[name="downloadUrl"]') as HTMLInputElement;

              if (genreEn) genreEn.value = item.genre_i18n?.en || "";
              if (genreTr) genreTr.value = item.genre_i18n?.tr || "";
              if (descEn) descEn.value = item.description_i18n?.en || "";
              if (descTr) descTr.value = item.description_i18n?.tr || "";
              if (statusEn) statusEn.value = item.status_i18n?.en || "";
              if (statusTr) statusTr.value = item.status_i18n?.tr || "";
              if (imageUrl) imageUrl.value = item.cover_image_url || "";
              if (videoUrl) videoUrl.value = item.trailer_url || "";
              if (downloadUrl) downloadUrl.value = (item as any).download_url || "";
      setImageGallery(item.image_gallery || []);
      setVideoGallery(item.video_gallery || []);

      // Platform links
      for (const p of platforms) {
        const input = form.querySelector(`[name="platform_${p.key}"]`) as HTMLInputElement;
        if (input) input.value = item.platform_links?.[p.key] || "";
      }
    } else {
      // News specific fields
      const catEn = form.querySelector('[name="category_en"]') as HTMLInputElement;
      const catTr = form.querySelector('[name="category_tr"]') as HTMLInputElement;
      const excerptEn = form.querySelector('[name="excerpt_en"]') as HTMLTextAreaElement;
      const excerptTr = form.querySelector('[name="excerpt_tr"]') as HTMLTextAreaElement;
      const bodyEn = form.querySelector('[name="body_en"]') as HTMLTextAreaElement;
      const bodyTr = form.querySelector('[name="body_tr"]') as HTMLTextAreaElement;

      if (catEn) catEn.value = item.category_i18n?.en || "";
      if (catTr) catTr.value = item.category_i18n?.tr || "";
      if (excerptEn) excerptEn.value = item.excerpt_i18n?.en || "";
      if (excerptTr) excerptTr.value = item.excerpt_i18n?.tr || "";
      if (bodyEn) bodyEn.value = item.body_i18n?.en || "";
      if (bodyTr) bodyTr.value = item.body_i18n?.tr || "";
    }
  };

  // Helper to add media
  const addMediaItem = (type: "image" | "video", value: string) => {
    if (type === "image") setImageGallery((prev) => [...prev, value]);
    else setVideoGallery((prev) => [...prev, value]);
  };
  const removeMediaItem = (type: "image" | "video", index: number) => {
    if (type === "image") setImageGallery((prev) => prev.filter((_, i) => i !== index));
    else setVideoGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Extract YouTube ID for thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("games")}
            className={
              tab === "games"
                ? "rounded-full bg-blue-600 px-3 py-2 text-xs"
                : "px-3 py-2 text-xs text-zinc-400"
            }
          >
            Oyunlar
          </button>
          <button
            onClick={() => setTab("news")}
            className={
              tab === "news"
                ? "rounded-full bg-blue-600 px-3 py-2 text-xs"
                : "px-3 py-2 text-xs text-zinc-400"
            }
          >
            Haberler
          </button>
        </div>
        <h2 className="mt-7 font-display text-2xl">
          {editingId
            ? "Düzenle"
            : tab === "games"
            ? "Oyun ekle"
            : "Haber yayınla"}
        </h2>
        <form
          id="cms-form"
          action={save}
          className="mt-5 grid gap-3"
        >
          <div className="grid gap-2">
            <p className="text-sm font-medium text-zinc-400">Başlık</p>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                required
                name="title_en"
                placeholder="English Title"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
              <input
                required
                name="title_tr"
                placeholder="Türkçe Başlık"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
            </div>
          </div>

          {tab === "games" ? (
            <>
              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Tür (Genre)</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    name="genre_en"
                    placeholder="English"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <input
                    name="genre_tr"
                    placeholder="Türkçe"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Durum (Status)</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    name="status_en"
                    placeholder="English"
                    defaultValue="Announced"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <input
                    name="status_tr"
                    placeholder="Türkçe"
                    defaultValue="Duyuruldu"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Platform Bağlantıları</p>
                {platforms.map((p) => (
                  <div key={p.key} className="flex gap-2 items-center">
                    <p.icon className="w-4 h-4 text-zinc-400" />
                    <input
                      name={`platform_${p.key}`}
                      type="url"
                      placeholder={`${p.label} URL`}
                      className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Kapak Görseli</p>
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="Kapak görseli URL"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm mb-1"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-zinc-400"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) {
                          const input = document.querySelector('[name="imageUrl"]') as HTMLInputElement;
                          if (input) input.value = url;
                        }
                      }
                    }}
                  />
                  {uploading && <p className="text-xs text-blue-400">Yükleniyor...</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Fragman (YouTube)</p>
                <input
                  name="videoUrl"
                  type="url"
                  placeholder="YouTube URL"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                />
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Oyun Dosyası (İndirme)</p>
                <input
                  name="downloadUrl"
                  type="url"
                  placeholder="Oyun dosyası URL"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm mb-1"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    className="text-sm text-zinc-400"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) {
                          const input = document.querySelector('[name="downloadUrl"]') as HTMLInputElement;
                          if (input) input.value = url;
                        }
                      }
                    }}
                  />
                  {uploading && <p className="text-xs text-blue-400">Yükleniyor...</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Görsel Galerisi</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {imageGallery.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img src={url} alt={`Görsel ${i+1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMediaItem("image", i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    type="url"
                    placeholder="Görsel URL ekle"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addMediaItem("image", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-zinc-400"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files) {
                        const url = await handleFileUpload(file);
                        if (url) addMediaItem("image", url);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Video Galerisi</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {videoGallery.map((url, i) => {
                    const thumb = getYouTubeThumbnail(url);
                    return (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                        {thumb ? (
                          <img src={thumb} alt={`Video ${i+1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Play className="w-6 h-6 text-white/50" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaItem("video", i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <input
                  type="url"
                  placeholder="YouTube URL ekle (Enter)"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      addMediaItem("video", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Açıklama</p>
                <div className="grid gap-2">
                  <textarea
                    required
                    name="description_en"
                    rows={3}
                    placeholder="English Description"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <textarea
                    required
                    name="description_tr"
                    rows={3}
                    placeholder="Türkçe Açıklama"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Kategori</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    name="category_en"
                    placeholder="English"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <input
                    name="category_tr"
                    placeholder="Türkçe"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Özet (Excerpt)</p>
                <div className="grid gap-2">
                  <textarea
                    required
                    name="excerpt_en"
                    rows={2}
                    placeholder="English Short Description"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <textarea
                    required
                    name="excerpt_tr"
                    rows={2}
                    placeholder="Türkçe Kısa Açıklama"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">İçerik (Body)</p>
                <div className="grid gap-2">
                  <textarea
                    required
                    name="body_en"
                    rows={4}
                    placeholder="English Full Content"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                  <textarea
                    required
                    name="body_tr"
                    rows={4}
                    placeholder="Türkçe Tam İçerik"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <label className="text-sm text-zinc-400">
            <input name="published" type="checkbox" /> Hemen yayınla
          </label>
          {message && <p className="text-sm text-blue-300">{message}</p>}
          <div className="flex gap-2">
            <button className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold">
              <Plus size={16} />
              {editingId ? "Güncelle" : "Kaydet"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setImageGallery([]);
                  setVideoGallery([]);
                  (document.getElementById("cms-form") as HTMLFormElement).reset();
                }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-bold text-zinc-400"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 p-5 font-display text-xl">
          {tab === "games" ? "Oyunlar" : "Haberler"}
        </div>
        {!supabase && (
          <div className="p-5 text-sm text-zinc-500">
            Bu bölüm için Supabase ortam değişkenleri gerekiyor.
          </div>
        )}
        <div className="divide-y divide-white/[.07]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.published ? "Yayında" : "Taslak"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePublish(item.id, item.published)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-blue-500 hover:text-blue-400"
                >
                  {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => editItem(item)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-blue-500 hover:text-blue-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
