"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import {
  FALLBACK_SUPABASE_ANON_KEY,
  FALLBACK_SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  warnSupabaseNotConfigured,
} from "./env";

export function createClient() {
  warnSupabaseNotConfigured();
  return createBrowserClient<Database>(
    SUPABASE_URL || FALLBACK_SUPABASE_URL,
    SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  );
}
