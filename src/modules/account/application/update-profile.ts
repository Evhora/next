import type { SupabaseClient } from "@supabase/supabase-js";

import { IntegrationError, ValidationError } from "@/shared/errors";

import { UpdateProfileSchema, type UpdateProfileCmd } from "./schemas";

export async function updateProfile(
  cmd: UpdateProfileCmd,
  supabase: SupabaseClient,
): Promise<void> {
  const parsed = UpdateProfileSchema.safeParse(cmd);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, display_name: fullName },
  });

  if (error) throw new IntegrationError(error.message);
}
