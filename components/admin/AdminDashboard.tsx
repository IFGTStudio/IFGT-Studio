"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ShieldCheck, UserRound, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const ROLES = ["player", "developer", "moderator", "admin"] as const;

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const loadProfiles = async () => {
    const supabase = createClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles((data ?? []) as Profile[]);
  };

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      if (!supabase) {
        setBackendUnavailable(true);
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return location.assign("/sign-in");

      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.user.id)
        .maybeSingle();

      if (me?.role !== "admin") return location.assign("/id");

      setAllowed(true);
      await loadProfiles();
    })();
  }, []);

  const updateRole = async (profileId: string, newRole: (typeof ROLES)[number]) => {
    const supabase = createClient();
    if (!supabase) return;

    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    await loadProfiles();
  };

  if (backendUnavailable) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 text-center text-zinc-500">
        Yönetim paneli için Supabase yapılandırması gerekiyor.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 text-center text-zinc-500">
        Yetki doğrulanıyor…
      </div>
    );
  }

  const admins = profiles?.filter((p) => p.role === "admin").length ?? 0;

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/id"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
        >
          <ArrowLeft size={16} /> IFGT ID
        </Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[.22em] text-blue-400">
          Yönetim
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[-.06em]">
          Kontrol merkezi.
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat icon={Users} label="Toplam kullanıcı" value={String(profiles?.length ?? "—")} />
          <Stat icon={ShieldCheck} label="Yöneticiler" value={String(admins || "—")} />
          <Stat icon={UserRound} label="Bekleyen profil" value="—" />
        </div>
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <h2 className="font-display text-xl">Kullanıcılar</h2>
            <span className="text-xs text-zinc-500">Rol ve profil yönetimi</span>
          </div>
          <div className="divide-y divide-white/[.07]">
            {profiles?.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-medium">@{profile.username ?? "profil bekliyor"}</p>
                  <p className="mt-1 text-xs text-zinc-500">{profile.ifgt_id}</p>
                  {profile.email && <p className="text-xs text-zinc-600">{profile.email}</p>}
                </div>
                <select
                  value={profile.role}
                  onChange={(e) => updateRole(profile.id, e.target.value as (typeof ROLES)[number])}
                  className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs capitalize text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <Icon size={18} className="text-blue-400" />
      <p className="mt-8 text-sm text-zinc-500">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
