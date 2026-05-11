import type { SupabaseClient } from "@supabase/supabase-js";

import { IntegrationError } from "@/shared/errors";

export async function deleteAccount(
  userId: string,
  adminSupabase: SupabaseClient,
): Promise<void> {
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) throw new IntegrationError(error.message);
}
