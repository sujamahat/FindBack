import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import {
  FALLBACK_SUPABASE_ANON_KEY,
  FALLBACK_SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  warnSupabaseNotConfigured,
} from "./env";

/**
 * Supabase client for Server Components / Server Actions / Route Handlers.
 * Uses the request's auth cookies, so RLS policies apply based on the
 * signed-in owner — never use this for public/anonymous data access.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  warnSupabaseNotConfigured();

  return createServerClient<Database>(
    SUPABASE_URL || FALLBACK_SUPABASE_URL,
    SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
    {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component without a mutable response;
          // middleware.ts refreshes the session cookie on every request.
        }
      },
    },
    }
  );
}
