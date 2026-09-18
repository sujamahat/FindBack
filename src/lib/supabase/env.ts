export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Harmless stand-ins so a missing .env.local doesn't hard-crash client creation.
// Nothing listens on this address: requests fail like any offline call, and
// auth.getUser() without a session cookie returns "no user" without a request.
export const FALLBACK_SUPABASE_URL = "http://127.0.0.1:54321";
export const FALLBACK_SUPABASE_ANON_KEY = "missing-supabase-anon-key";

let warned = false;
export function warnSupabaseNotConfigured() {
  if (isSupabaseConfigured || warned) return;
  warned = true;
  console.warn(
    "[FindBack] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Running without Supabase (demo mode). Copy .env.example to .env.local to enable it."
  );
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function assertPublicSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. .env.example을 참고해 .env.local을 구성해주세요."
    );
  }
}
