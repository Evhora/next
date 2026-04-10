import type { createClient } from "./server";

/**
 * Repositories accept this type instead of `SupabaseClient<Database>` because
 * the `@supabase/ssr` server client carries an extra `PostgrestVersion` slot
 * that the standalone supabase-js generic doesn't expose. Inferring it from
 * the actual factory keeps the schema typing intact.
 */
export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
