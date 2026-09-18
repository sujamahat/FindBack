import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL } from "./env";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely, so it
 * must only be used inside trusted server code (Route Handlers, Server
 * Actions) that has already validated its inputs — never import this from a
 * Client Component, and never let SUPABASE_SERVICE_ROLE_KEY leak into a
 * NEXT_PUBLIC_* variable.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE URL이 설정되지 않았습니다."
    );
  }

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
