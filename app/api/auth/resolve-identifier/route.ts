import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { identifier?: string }
    | null;

  const identifier = body?.identifier?.trim() ?? "";

  if (!identifier) {
    return NextResponse.json({ error: "Identifier is required." }, { status: 400 });
  }

  if (identifier.includes("@")) {
    return NextResponse.json({ email: identifier });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("get_login_email", {
    candidate: normalizeUsername(identifier),
  });

  if (error || !data) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı adı veya şifre." },
      { status: 404 }
    );
  }

  return NextResponse.json({ email: data });
}
