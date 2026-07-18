"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Kind = "announcements" | "developer_posts" | "jobs";
type Item = { 
  id: string; 
  title: string; 
  published: boolean;
  title_i18n?: { tr?: string; en?: string };
  body_i18n?: { tr?: string; en?: string };
  description_i18n?: { tr?: string; en?: string };
  team_i18n?: { tr?: string; en?: string };
  location_i18n?: { tr?: string; en?: string };
  apply_url?: string;
  image_url?: string;
  video_url?: string;
};

export function OtherContentManager() {
  const [kind, setKind] = useState<Kind>("announcements");
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabase = createClient();

  const load = async () => {
    if (!supabase) {
      setItems([]);
      return;
    }

    const { data } = await supabase
      .from(kind)
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Item[]);
  };

  useEffect(() => {
    load();
  }, [kind]);

  async function save(data: FormData) {
    if (!supabase) {
      setMessage("İçerik yönetimi için Supabase yapılandırması gerekiyor.");
      return;
    }
    const title_en = String(data.get("title_en"));
    const title_tr = String(data.get("title_tr"));
    const title = title_en || title_tr;
    const body_en = String(data.get("body_en"));
    const body_tr = String(data.get("body_tr"));
    const body = body_en || body_tr;
    const title_i18n = { tr: title_tr || title_en, en: title_en || title_tr };
    const body_i18n = { tr: body_tr || body_en, en: body_en || body_tr };
    const published = data.get("published") === "on";

    const payload =
      kind === "announcements"
        ? { title, title_i18n, body, body_i18n, published }
        : kind === "developer_posts"
        ? {
            title, title_i18n,
            body, body_i18n,
            published,
            image_url: String(data.get("image")) || null,
            video_url: String(data.get("video")) || null,
          }
        : {
            title, title_i18n,
            description: body,
            description_i18n: body_i18n,
            published,
            team: String(data.get("team_en")) || String(data.get("team_tr")),
            team_i18n: { tr: String(data.get("team_tr")) || String(data.get("team_en")), en: String(data.get("team_en")) || String(data.get("team_tr")) },
            location: String(data.get("location_en")) || String(data.get("location_tr")),
            location_i18n: { tr: String(data.get("location_tr")) || String(data.get("location_en")), en: String(data.get("location_en")) || String(data.get("location_tr")) },
            apply_url: String(data.get("apply")) || null,
          };

    if (editingId) {
      const { error } = await supabase
        .from(kind)
        .update(payload as never)
        .eq("id", editingId);
      setMessage(error ? error.message : "Güncellendi.");
      setEditingId(null);
    } else {
      const { error } = await supabase
        .from(kind)
        .insert(payload as never);
      setMessage(error ? error.message : "Kaydedildi.");
    }

    (document.getElementById("other-form") as HTMLFormElement).reset();
    load();
  }

  async function togglePublish(id: string, published: boolean) {
    if (!supabase) return;

    const { error } = await supabase
      .from(kind)
      .update({ published: !published })
      .eq("id", id);
    if (!error) load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Silmek istediğine emin misin?")) return;
    if (!supabase) return;
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (!error) load();
  }

  function editItem(item: Item) {
    setEditingId(item.id);
    const form = document.getElementById("other-form") as HTMLFormElement;
    
    // Fill title
    const titleEn = form.querySelector('[name="title_en"]') as HTMLInputElement;
    const titleTr = form.querySelector('[name="title_tr"]') as HTMLInputElement;
    if (titleEn) titleEn.value = item.title_i18n?.en || item.title || "";
    if (titleTr) titleTr.value = item.title_i18n?.tr || item.title || "";

    // Fill body
    const bodyEn = form.querySelector('[name="body_en"]') as HTMLTextAreaElement;
    const bodyTr = form.querySelector('[name="body_tr"]') as HTMLTextAreaElement;
    if (bodyEn) bodyEn.value = item.body_i18n?.en || item.description_i18n?.en || "";
    if (bodyTr) bodyTr.value = item.body_i18n?.tr || item.description_i18n?.tr || "";

    if (kind === "jobs") {
      // Jobs specific
      const teamEn = form.querySelector('[name="team_en"]') as HTMLInputElement;
      const teamTr = form.querySelector('[name="team_tr"]') as HTMLInputElement;
      const locationEn = form.querySelector('[name="location_en"]') as HTMLInputElement;
      const locationTr = form.querySelector('[name="location_tr"]') as HTMLInputElement;
      const applyUrl = form.querySelector('[name="apply"]') as HTMLInputElement;

      if (teamEn) teamEn.value = item.team_i18n?.en || "";
      if (teamTr) teamTr.value = item.team_i18n?.tr || "";
      if (locationEn) locationEn.value = item.location_i18n?.en || "";
      if (locationTr) locationTr.value = item.location_i18n?.tr || "";
      if (applyUrl) applyUrl.value = item.apply_url || "";
    }

    if (kind === "developer_posts") {
      // Dev posts specific
      const image = form.querySelector('[name="image"]') as HTMLInputElement;
      const video = form.querySelector('[name="video"]') as HTMLInputElement;
      if (image) image.value = item.image_url || "";
      if (video) video.value = item.video_url || "";
    }
  }

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <h2 className="font-display text-2xl">
          {editingId ? "Düzenle" : "İçerik ekle"}
        </h2>
        <form
          id="other-form"
          action={save}
          className="mt-5 grid gap-3"
        >
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <option value="announcements">Duyuru</option>
            <option value="developer_posts">Geliştirici içeriği</option>
            <option value="jobs">İlan / iş fırsatı</option>
          </select>
          
          <div className="grid gap-2">
            <p className="text-sm font-medium text-zinc-400">Başlık</p>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                required
                name="title_en"
                placeholder="English Title"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <input
                required
                name="title_tr"
                placeholder="Türkçe Başlık"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </div>
          </div>
          
          {kind === "jobs" && (
            <>
              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Ekip</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    required
                    name="team_en"
                    placeholder="English"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                  <input
                    required
                    name="team_tr"
                    placeholder="Türkçe"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-400">Konum</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    required
                    name="location_en"
                    placeholder="English"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                  <input
                    required
                    name="location_tr"
                    placeholder="Türkçe"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </div>
              </div>
              
              <input
                name="apply"
                placeholder="Başvuru URL"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </>
          )}
          
          {kind === "developer_posts" && (
            <>
              <input
                name="image"
                placeholder="Görsel URL"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <input
                name="video"
                placeholder="Video URL"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </>
          )}
          
          <div className="grid gap-2">
            <p className="text-sm font-medium text-zinc-400">{kind === "jobs" ? "Açıklama" : "İçerik"}</p>
            <div className="grid gap-2">
              <textarea
                required
                name="body_en"
                rows={4}
                placeholder={kind === "jobs" ? "English Description" : "English Content"}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <textarea
                required
                name="body_tr"
                rows={4}
                placeholder={kind === "jobs" ? "Türkçe Açıklama" : "Türkçe İçerik"}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </div>
          </div>

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
                  (document.getElementById("other-form") as HTMLFormElement).reset();
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
          {kind === "announcements"
            ? "Duyurular"
            : kind === "developer_posts"
            ? "Geliştirici içerikleri"
            : "İlanlar"}
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
