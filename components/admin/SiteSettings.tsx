"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/hooks/useLocale";

type SiteSetting = {
  id: string;
  key: string;
  value: string;
  value_tr?: string;
  value_en?: string;
};

export function SiteSettings() {
  const locale = useLocale();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [heroBgUrlInput, setHeroBgUrlInput] = useState("");
  const [heroBgVideoInput, setHeroBgVideoInput] = useState("");
  const [heroGalleryInput, setHeroGalleryInput] = useState<string[]>([]);
  const [tempGalleryUrl, setTempGalleryUrl] = useState("");
  const supabase = createClient();

  // Get current hero settings from settings
  const currentHeroBg = settings.find(s => s.key === "hero.backgroundImage");
  const currentHeroVideo = settings.find(s => s.key === "hero.backgroundVideo");
  const currentHeroGallery = settings.find(s => s.key === "hero.gallery");

  const loadSettings = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    console.log("loadSettings - data:", data, "error:", error);
    setSettings((data as SiteSetting[]) ?? []);
    // Set current hero bg URL in input
    const heroSetting = (data as SiteSetting[])?.find((s: SiteSetting) => s.key === "hero.backgroundImage");
    if (heroSetting) {
      setHeroBgUrlInput(heroSetting.value_tr || heroSetting.value_en || "");
    }
    // Set current hero video URL
    const heroVideoSetting = (data as SiteSetting[])?.find((s: SiteSetting) => s.key === "hero.backgroundVideo");
    if (heroVideoSetting) {
      setHeroBgVideoInput(heroVideoSetting.value_tr || heroVideoSetting.value_en || "");
    }
    // Set current hero gallery
    const heroGallerySetting = (data as SiteSetting[])?.find((s: SiteSetting) => s.key === "hero.gallery");
    if (heroGallerySetting?.value_tr) {
      try {
        setHeroGalleryInput(JSON.parse(heroGallerySetting.value_tr));
      } catch {
        setHeroGalleryInput([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveHeroSettings() {
    if (!supabase) {
      setMessage("Site ayarları için Supabase yapılandırması gerekiyor.");
      return;
    }
    setMessage("");
    try {
      // Save background image
      const existingBg = settings.find(s => s.key === "hero.backgroundImage");
      if (existingBg) {
        await supabase
          .from("site_settings")
          .update({ value: heroBgUrlInput, value_tr: heroBgUrlInput, value_en: heroBgUrlInput })
          .eq("key", "hero.backgroundImage");
      } else {
        await supabase
          .from("site_settings")
          .insert({ key: "hero.backgroundImage", value: heroBgUrlInput, value_tr: heroBgUrlInput, value_en: heroBgUrlInput });
      }

      // Save background video
      const existingVideo = settings.find(s => s.key === "hero.backgroundVideo");
      if (existingVideo) {
        await supabase
          .from("site_settings")
          .update({ value: heroBgVideoInput, value_tr: heroBgVideoInput, value_en: heroBgVideoInput })
          .eq("key", "hero.backgroundVideo");
      } else {
        await supabase
          .from("site_settings")
          .insert({ key: "hero.backgroundVideo", value: heroBgVideoInput, value_tr: heroBgVideoInput, value_en: heroBgVideoInput });
      }

      // Save gallery
      const galleryJson = JSON.stringify(heroGalleryInput);
      const existingGallery = settings.find(s => s.key === "hero.gallery");
      if (existingGallery) {
        await supabase
          .from("site_settings")
          .update({ value: galleryJson, value_tr: galleryJson, value_en: galleryJson })
          .eq("key", "hero.gallery");
      } else {
        await supabase
          .from("site_settings")
          .insert({ key: "hero.gallery", value: galleryJson, value_tr: galleryJson, value_en: galleryJson });
      }

      setMessage("Hero ayarları kaydedildi!");
      loadSettings();
    } catch (error: any) {
      setMessage(error.message || "Bir hata oluştu!");
    }
  }

  // Helper to add gallery item
  const addGalleryItem = () => {
    if (tempGalleryUrl) {
      setHeroGalleryInput([...heroGalleryInput, tempGalleryUrl]);
      setTempGalleryUrl("");
    }
  }

  // Helper to remove gallery item
  const removeGalleryItem = (index: number) => {
    setHeroGalleryInput(heroGalleryInput.filter((_, i) => i !== index));
  }

  async function save(data: FormData) {
    if (!supabase) {
      setMessage("Site ayarları için Supabase yapılandırması gerekiyor.");
      return;
    }
    let key = String(data.get("key"));
    let value_tr = String(data.get("value_tr"));
    let value_en = String(data.get("value_en"));
    
    const value = locale === "tr" ? value_tr : value_en;

    if (editingKey) {
      const { error } = await supabase
        .from("site_settings")
        .update({ key, value, value_tr, value_en })
        .eq("key", editingKey);
      setMessage(error ? error.message : "Ayar güncellendi.");
      setEditingKey(null);
    } else {
      const { error } = await supabase
        .from("site_settings")
        .insert({ key, value, value_tr, value_en });
      setMessage(error ? error.message : "Ayar kaydedildi.");
    }
    (document.getElementById("settings-form") as HTMLFormElement).reset();
    loadSettings();
  }

  async function deleteSetting(key: string) {
    if (!confirm("Silmek istediğine emin misin?")) return;
    if (!supabase) return;
    const { error } = await supabase.from("site_settings").delete().eq("key", key);
    if (!error) loadSettings();
  }

  function editSetting(setting: SiteSetting) {
    setEditingKey(setting.key);
    const form = document.getElementById("settings-form") as HTMLFormElement;
    (form.elements.namedItem("key") as HTMLInputElement).value = setting.key;
    (form.elements.namedItem("value_tr") as HTMLInputElement).value = setting.value_tr || "";
    (form.elements.namedItem("value_en") as HTMLInputElement).value = setting.value_en || "";
  }

  return (
    <section className="mt-10 grid gap-6">
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6 text-center">
          <p className="text-zinc-400">Ayarlar yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Hero Background Section */}
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <h2 className="font-display text-2xl">Hero Arka Planı</h2>
            <div className="mt-5 grid gap-6">
              {/* Background Image */}
              <div className="grid gap-3">
                <h3 className="font-medium text-lg">Görsel Arka Planı</h3>
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-zinc-400">Dosya Yolu (public klasöründen başlayarak, örn: /hero/background.jpg)</p>
                  <input
                    type="text"
                    value={heroBgUrlInput}
                    onChange={(e) => setHeroBgUrlInput(e.target.value)}
                    placeholder="/hero/background.jpg"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </div>
                {currentHeroBg?.value_tr && (
                  <div className="mt-2">
                    <p className="text-sm text-zinc-400 mb-1">Mevcut Görsel:</p>
                    <img
                      src={currentHeroBg.value_tr}
                      alt="Current hero background"
                      className="w-full max-w-xs h-32 object-cover rounded-lg border border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Background Video */}
              <div className="grid gap-3">
                <h3 className="font-medium text-lg">Video Arka Planı</h3>
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-zinc-400">Dosya Yolu (veya YouTube URL)</p>
                  <input
                    type="text"
                    value={heroBgVideoInput}
                    onChange={(e) => setHeroBgVideoInput(e.target.value)}
                    placeholder="/hero/background.mp4"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </div>
                {currentHeroVideo?.value_tr && (
                  <div className="mt-2">
                    <p className="text-sm text-zinc-400 mb-1">Mevcut Video:</p>
                    {currentHeroVideo.value_tr.includes("youtube.com") || currentHeroVideo.value_tr.includes("youtu.be") ? (
                      <div className="w-full max-w-xs rounded-lg border border-white/10 overflow-hidden">
                        <iframe
                          width="100%"
                          height="200"
                          src={`${currentHeroVideo.value_tr.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}?autoplay=1&mute=1&loop=1&playlist=${currentHeroVideo.value_tr.split("v=")[1] || currentHeroVideo.value_tr.split("/").pop()}`}
                          title="Hero background video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video
                        src={currentHeroVideo.value_tr}
                        className="w-full max-w-xs h-32 object-cover rounded-lg border border-white/10"
                        controls
                        muted
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Gallery */}
              <div className="grid gap-3">
                <h3 className="font-medium text-lg">Otomatik Oynatan Galeri</h3>
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-zinc-400">Galeri Öğeleri (dosya yolu veya URL)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempGalleryUrl}
                      onChange={(e) => setTempGalleryUrl(e.target.value)}
                      placeholder="/hero/gallery1.jpg"
                      className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    />
                    <button
                      onClick={addGalleryItem}
                      className="rounded-full bg-blue-600 px-4 py-3 text-sm font-bold"
                    >
                      Ekle
                    </button>
                  </div>
                  {heroGalleryInput.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {heroGalleryInput.map((url, index) => (
                        <div key={index} className="relative rounded-lg border border-white/10 overflow-hidden aspect-video">
                          {url.includes(".mp4") || url.includes(".webm") || url.includes(".mov") ? (
                            <video
                              src={url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Gallery item ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removeGalleryItem(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveHeroSettings}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold"
                >
                  <Upload size={16} />
                  Tüm Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
              <h2 className="font-display text-2xl">
                {editingKey ? "Düzenle" : "Yeni Ayar Ekle"}
              </h2>
              <form
                id="settings-form"
                action={save}
                className="mt-5 grid gap-3"
              >
                <input
                  required
                  name="key"
                  placeholder="Ayar Anahtarı (örn: footer_tagline)"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <textarea
                  name="value_tr"
                  rows={2}
                  placeholder="Türkçe Değer"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <textarea
                  name="value_en"
                  rows={2}
                  placeholder="İngilizce Değer"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                />
                {message && <p className="text-sm text-blue-300">{message}</p>}
                <div className="flex gap-2">
                  <button className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold">
                    <Plus size={16} />
                    {editingKey ? "Güncelle" : "Kaydet"}
                  </button>
                  {editingKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKey(null);
                        (document.getElementById("settings-form") as HTMLFormElement).reset();
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
                Site Ayarları
              </div>
              {!supabase && (
                <div className="p-5 text-sm text-zinc-500">
                  Bu bölüm için Supabase ortam değişkenleri gerekiyor.
                </div>
              )}
              <div className="divide-y divide-white/[.07]">
                {settings
                  .filter(s => s.key !== "hero.backgroundImage" && s.key !== "hero.backgroundVideo" && s.key !== "hero.gallery")
                  .map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div>
                        <p className="font-medium">{setting.key}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {locale === "tr" ? setting.value_tr : setting.value_en}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editSetting(setting)}
                          className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-blue-500 hover:text-blue-400"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteSetting(setting.key)}
                          className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-red-500 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
