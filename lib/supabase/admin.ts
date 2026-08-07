import { createClient } from "@supabase/supabase-js";

/**
 * Cliente admin (service role). Somente server-side / scripts.
 * Nunca importar em Client Components.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin: URL ou SERVICE_ROLE_KEY ausentes.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
