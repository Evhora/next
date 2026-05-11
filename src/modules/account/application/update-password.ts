import type { SupabaseClient } from "@supabase/supabase-js";

import { IntegrationError, ValidationError } from "@/shared/errors";

import { UpdatePasswordSchema, type UpdatePasswordCmd } from "./schemas";

export async function updatePassword(
  cmd: UpdatePasswordCmd,
  supabase: SupabaseClient,
): Promise<void> {
  const parsed = UpdatePasswordSchema.safeParse(cmd);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) throw new IntegrationError(error.message);
}
