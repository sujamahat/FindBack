import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Only allow same-site relative paths, so `next` can't redirect off-site. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  // PKCE flow (magic link opened in the same browser that requested it).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[findback] exchangeCodeForSession failed:", error.message);
  }

  // Token-hash flow (works from any browser/device; needs the email template
  // to link to {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email).
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[findback] verifyOtp failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth&next=${encodeURIComponent(next)}`);
}
