"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Gamepad2,
  Globe2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { ProfileSetup } from "@/components/id/ProfileSetup";

export function AccountPanel() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: any } | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setSupabaseAvailable(false);
      setUser(null);
      return;
    }
    setSupabaseAvailable(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setUser(null);
    setUser(data.user);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    setProfile(profileData as Profile | null);
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    location.assign("/");
  }

  if (user === undefined)
    return (
      <div className="min-h-screen bg-[#050505] pt-32 text-center text-zinc-500">
        IFGT ID yükleniyor…
      </div>
    );

  if (!user) {
    if (!supabaseAvailable) {
      return (
        <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-32 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[.04] p-8">
            <p className="text-sm text-zinc-400">
              IFGT ID sistemi henüz yapılandırılmamış. Supabase ortam değişkenleri eklenmeden bu alan kullanılamaz.
            </p>
          </div>
        </main>
      );
    }
    location.assign("/sign-in");
    return null;
  }

  if (!profile?.username)
    return (
      <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-32 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-400">
            IFGT ID
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-[-.06em]">
            Sana ait bir isim.
          </h1>
          <ProfileSetup
            userId={user.id}
            userMetadata={user.user_metadata}
            onComplete={load}
          />
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-400">
          IFGT ID
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[-.06em]">
          Merhaba, {profile.username}.
        </h1>
        <p className="mt-3 text-zinc-500">
          {user.email} ·{" "}
          <span className="font-medium text-blue-300">{profile.ifgt_id}</span>
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 md:col-span-2">
            <ShieldCheck className="text-blue-400" />
            <h2 className="mt-8 font-display text-2xl">Hesabın güvende.</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Oturumun tarayıcıda güvenle kalır. IFGT ID’in tüm oyun ve topluluk
              deneyimlerinde kullanılacak.
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-6">
            <UserRound className="text-zinc-400" />
            <p className="mt-8 text-sm text-zinc-500">Oyuncu profili</p>
            <p className="mt-2 font-display text-xl">@{profile.username}</p>
            <p className="mt-2 text-sm text-zinc-500 capitalize">{profile.role}</p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-6">
            <Globe2 className="text-zinc-400" />
            <p className="mt-8 text-sm text-zinc-500">Ulke</p>
            <p className="mt-2 font-display text-xl">{profile.country || "Belirtilmedi"}</p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-6">
            <CalendarDays className="text-zinc-400" />
            <p className="mt-8 text-sm text-zinc-500">Kayit tarihi</p>
            <p className="mt-2 font-display text-xl">
              {new Date(profile.created_at).toLocaleDateString("tr-TR")}
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-6 md:col-span-3">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.username ?? "IFGT avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="text-zinc-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-zinc-500">Biyografi</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {profile.bio || "Henüz bir biyografi eklenmedi."}
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-6 md:col-span-3">
            <Gamepad2 className="text-blue-400" />
            <h2 className="mt-5 font-display text-2xl">Oyun kütüphanen</h2>
            <p className="mt-2 text-sm text-zinc-500">
              IFGT oyunları çıktığında burada görünecek.
            </p>
          </section>
        </div>
        {profile.role === "admin" && (
          <Link
            href="/admin"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-zinc-200 hover:border-blue-500"
          >
            <LayoutDashboard size={16} />
            Admin kontrol paneli
          </Link>
        )}
        <button
          onClick={signOut}
          className="mt-8 ml-5 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <LogOut size={16} />
          Çıkış yap
        </button>
      </div>
    </main>
  );
}
