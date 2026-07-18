import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUsernameIssues, normalizeUsername } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get("username") ?? "";
  const normalized = normalizeUsername(rawUsername);
  const issues = getUsernameIssues(rawUsername);

  if (!rawUsername) {
    return NextResponse.json({ available: false, normalized, issues }, { status: 400 });
  }

  if (issues.length > 0 || normalized !== rawUsername) {
    return NextResponse.json({ available: false, normalized, issues });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { available: false, normalized, issues: ["Kimlik sistemi henüz yapılandırılmamış."] },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.rpc("is_username_available", {
    candidate: normalized,
  });

  if (error) {
    return NextResponse.json(
      { available: false, normalized, issues: ["Kullanıcı adı kontrol edilemedi."] },
      { status: 500 }
    );
  }

  return NextResponse.json({ available: Boolean(data), normalized, issues: [] });
}
