import { createClient } from "@supabase/supabase-js";

import { Database } from "./database.types";

/**
 * Service-role Supabase client. Bypasses RLS — only use from trusted server
 * code (webhooks, cron jobs, or other paths that have already authenticated
 * the caller themselves). Never expose via a client bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
