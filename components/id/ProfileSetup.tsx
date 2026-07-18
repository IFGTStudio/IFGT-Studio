"use client";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUsernameIssues, isValidUsername, normalizeUsername } from "@/lib/auth";

export function ProfileSetup({ userId, userMetadata, onComplete }: { userId: string; userMetadata?: any; onComplete: () => void }) {
  const [username, setUsername] = useState(userMetadata?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(userMetadata?.avatar_url || "");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "invalid" | "taken" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!username) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    if (!isValidUsername(username)) {
      setStatus("invalid");
      setStatusMessage(getUsernameIssues(username)[0] ?? "Geçersiz kullanıcı adı.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setStatus("checking");
        setStatusMessage("Kontrol ediliyor...");

        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`,
          { signal: controller.signal }
        );
        const result = (await response.json()) as {
          available?: boolean;
          issues?: string[];
        };

        if (userMetadata?.username === username) {
          setStatus("available");
          setStatusMessage("Bu kullanıcı adı sana ait.");
          return;
        }

        if (result.issues?.length) {
          setStatus("invalid");
          setStatusMessage(result.issues[0]);
          return;
        }

        if (result.available) {
          setStatus("available");
          setStatusMessage("Kullanıcı adı kullanılabilir.");
          return;
        }

        setStatus("taken");
        setStatusMessage("Bu kullanıcı adı alınmış.");
      } catch {
        if (controller.signal.aborted) return;
        setStatus("error");
        setStatusMessage("Kullanıcı adı kontrol edilemedi.");
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [username, userMetadata?.username]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!isValidUsername(username)) {
      setLoading(false);
      setError(getUsernameIssues(username)[0] ?? "Geçersiz kullanıcı adı.");
      return;
    }

    if (status !== "available") {
      setLoading(false);
      setError("Devam etmeden önce uygun bir kullanıcı adı seç.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setError("Profil sistemi henüz yapılandırılmamış.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username: normalizeUsername(username),
        avatar_url: avatarUrl || null,
        bio: bio || null,
        country: country || null,
      });
    
    setLoading(false);
    
    if (error) {
      return setError(
        error.code === "23505" ? "Bu kullanıcı adı alınmış." : error.message
      );
    }
    
    onComplete();
  }

  return (
    <form onSubmit={save} className="mt-10 max-w-lg rounded-3xl border border-blue-500/30 bg-blue-500/[.08] p-7">
      <Check className="text-blue-400" />
      <h2 className="mt-5 font-display text-2xl">IFGT profilini oluştur</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Bu kullanıcı adı herkese açık olur. Küçük harf, rakam ve alt çizgi kullanabilirsin.
      </p>
      <label className="mt-6 block text-sm text-zinc-400">
        Kullanıcı adı
        <div className="relative">
          <input
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]+"
            value={username}
            onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500"
            placeholder="ornek_oyuncu"
          />
          <span className="absolute right-4 top-5 text-zinc-400">
            {status === "checking" && <LoaderCircle size={18} className="animate-spin" />}
            {status === "available" && <CheckCircle2 size={18} className="text-green-400" />}
            {(status === "taken" || status === "invalid" || status === "error") && (
              <XCircle size={18} className="text-red-400" />
            )}
          </span>
        </div>
      </label>
      <p className="mt-2 text-xs text-zinc-500">3-20 karakter, sadece `a-z`, `0-9` ve `_`</p>
      {statusMessage && (
        <p className={`mt-2 text-xs ${status === "available" ? "text-green-300" : "text-red-300"}`}>
          {statusMessage}
        </p>
      )}
      <label className="mt-5 block text-sm text-zinc-400">
        Avatar URL
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="https://..."
        />
      </label>
      <label className="mt-5 block text-sm text-zinc-400">
        Ülke
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          maxLength={60}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Turkiye"
        />
      </label>
      <label className="mt-5 block text-sm text-zinc-400">
        Biyografi
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={4}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Kendinden kisaca bahset."
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <button
        disabled={loading || status !== "available"}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold disabled:opacity-60"
      >
        {loading && <LoaderCircle size={16} className="animate-spin" />}
        Profili kaydet
      </button>
    </form>
  );
}
